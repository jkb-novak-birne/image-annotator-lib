(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ImageAnnotatorLib = factory());
})(this, (function () { 'use strict';

    class Annotator {
        constructor(imageUrl, onPointAdded, initialPoints = []) {
            this.imageUrl = imageUrl;
            this.points = initialPoints.map((point, index) => ({ ...point, id: index + 1 })); // Assign IDs to points
            this.onPointAdded = null;
            this.onPointClicked = null; // Callback for point click events
            this.selectedPointId = null; // Track the selected point

            // Set the container as a constant
            this.container = document.getElementById('image-annotator');
            if (!this.container) {
                throw new Error('Container with ID "image-annotator" not found.');
            }

            this.originalImageWidth = 0; // Store the original image width
            this.originalImageHeight = 0; // Store the original image height
            this.scaleFactor = 1; // Scaling factor for points

            this.loadImage();
            window.addEventListener('resize', () => this.resizeCanvas()); // Handle resizing
        }

        async loadImage() {
            try {
                const response = await fetch(this.imageUrl, { mode: 'cors' });
                if (!response.ok) {
                    throw new Error(`Failed to fetch image: ${response.statusText}`);
                }
                const blob = await response.blob();
                const dataUrl = URL.createObjectURL(blob);
                const img = new Image();
                img.src = dataUrl;
                img.onload = () => {
                    this.originalImageWidth = img.width;
                    this.originalImageHeight = img.height;
                    this.renderImage(img);
                };
            } catch (error) {
                console.error('Error loading image:', error);
            }
        }

        renderImage(img) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            this.canvas = canvas;
            this.ctx = ctx;

            this.resizeCanvas(); // Adjust canvas size and scale points
            this.container.appendChild(canvas); // Append canvas to the resolved container
            this.setupCanvasEvents();

            // Draw predefined points
            this.points.forEach(point => this.drawPoint(point));
            this.setupPointClickEvents();
            this.setupHoverEvents();
        }

        resizeCanvas() {
            if (!this.canvas || !this.ctx) return;

            // Calculate the scaling factor based on the container's width
            const containerWidth = this.container.offsetWidth;
            this.scaleFactor = containerWidth / this.originalImageWidth;

            // Adjust canvas size
            this.canvas.width = containerWidth;
            this.canvas.height = this.originalImageHeight * this.scaleFactor;

            // Redraw the image and points
            const img = new Image();
            img.src = this.imageUrl;
            img.onload = () => {
                this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                this.points.forEach(point => this.drawPoint(point));
            };
        }

    setupCanvasEvents() {
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (event.clientX - rect.left) / this.scaleFactor; // Scale the x-coordinate
            const y = (event.clientY - rect.top) / this.scaleFactor; // Scale the y-coordinate

            // Check if a point was clicked
            const clickedPoint = this.points.find(point => {
                const dx = x - point.x;
                const dy = y - point.y;
                return Math.sqrt(dx * dx + dy * dy) <= 10 / this.scaleFactor; // Adjust radius for scaling
            });

            // If a point was clicked, do not create a new one
            if (clickedPoint) {
                return;
            }

            // Add point without prompting for data
            this.addPoint(x, y, '');
        });
    }

        setupPointClickEvents() {
            this.canvas.addEventListener('click', (event) => {
                const rect = this.canvas.getBoundingClientRect();
                const x = (event.clientX - rect.left) / this.scaleFactor; // Scale the x-coordinate
                const y = (event.clientY - rect.top) / this.scaleFactor; // Scale the y-coordinate

                // Check if a point was clicked
                const clickedPoint = this.points.find(point => {
                    const dx = x - point.x;
                    const dy = y - point.y;
                    return Math.sqrt(dx * dx + dy * dy) <= 10 / this.scaleFactor; // Adjust radius for scaling
                });

                if (clickedPoint) {
                    this.selectedPointId = clickedPoint.id; // Update the selected point
                    this.redrawPoints(); // Redraw points to reflect the selection
                    if (typeof this.onPointClicked === 'function') {
                        this.onPointClicked(clickedPoint); // Trigger the callback with the clicked point
                    }
                }
            });
        }

        setupHoverEvents() {
            this.canvas.addEventListener('mousemove', (event) => {
                const rect = this.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                // Check if hovering over a point
                const hoveredPoint = this.points.find(point => {
                    const dx = x - point.x;
                    const dy = y - point.y;
                    return Math.sqrt(dx * dx + dy * dy) <= 10; // 10px radius for hover detection
                });

                // Change cursor to hand if hovering over a point
                this.canvas.style.cursor = hoveredPoint ? 'pointer' : 'default';
            });
        }

        addPoint(x, y, data) {
            const id = this.points.length > 0 ? Math.max(...this.points.map(point => point.id)) + 1 : 1; // Assign the highest available ID + 1
            const point = { id, x, y, data };
            this.points.push(point);
            this.drawPoint(point);
            if (typeof this.onPointAdded === 'function') {
                const result = this.onPointAdded(point, this.points);
                if (result instanceof Promise) {
                    result.catch(error => console.error('Error in onPointAdded:', error)); // Handle async errors
                }
            }
        }

        deletePoint(pointId) {
            // Remove the point from the points array
            this.points = this.points.filter(point => point.id !== pointId);

            // Clear the selected point if it was deleted
            if (this.selectedPointId === pointId) {
                this.selectedPointId = null;
            }

            // Redraw the canvas
            this.redrawPoints();

            // Trigger a callback if needed (optional)
            if (typeof this.onPointDeleted === 'function') {
                this.onPointDeleted(this.points);
            }
        }

        drawPoint(point) {
            // Scale the point coordinates
            const scaledX = point.x * this.scaleFactor;
            const scaledY = point.y * this.scaleFactor;

            // Draw the point
            this.ctx.fillStyle = point.id === this.selectedPointId ? 'blue' : 'red'; // Highlight selected point in blue
            this.ctx.beginPath();
            this.ctx.arc(scaledX, scaledY, 10 * this.scaleFactor, 0, Math.PI * 2); // Adjust radius for scaling
            this.ctx.fill();

            // Draw the point ID
            this.ctx.fillStyle = 'white';
            this.ctx.font = `${12 * this.scaleFactor}px Arial`; // Adjust font size for scaling
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(point.id, scaledX, scaledY);
        }

        redrawPoints() {
            // Clear the canvas and redraw all points
            this.resizeCanvas(); // Automatically redraws the image and points
        }

        exportImage() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = this.canvas.width;
            canvas.height = this.canvas.height;

            // Draw the original image
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Ensure cross-origin compatibility
            img.src = this.imageUrl;
            return new Promise((resolve) => {
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);

                    // Draw the points as an overlay
                    this.points.forEach(point => {
                        // Draw the point
                        ctx.fillStyle = 'red';
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, 10, 0, Math.PI * 2); // Match canvas styling
                        ctx.fill();

                        // Draw the point ID
                        ctx.fillStyle = 'white';
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(point.id, point.x, point.y);
                    });

                    // Convert the canvas to a data URL
                    const annotatedImage = canvas.toDataURL('image/png');

                    // Create a downloadable link
                    const link = document.createElement('a');
                    link.href = annotatedImage;
                    link.download = 'annotated-image.png';
                    link.click();

                    resolve();
                };
            });
        }
    }

    const imageAnnotatorLib = {
        Annotator,
    };

    return imageAnnotatorLib;

}));
