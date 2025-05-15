class Annotator {
    constructor(imageUrl, onPointAdded, initialPoints = [], container = document.body) {
        this.imageUrl = imageUrl;
        this.points = initialPoints.map((point, index) => ({ ...point, id: index + 1 })); // Assign IDs to points
        this.onPointAdded = null;
        this.onPointClicked = null; // Callback for point click events
        this.selectedPointId = null; // Track the selected point
        this.container = container; // DOM container for the canvas
        this.loadImage();
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
                this.renderImage(img);
            };
        } catch (error) {
            console.error('Error loading image:', error);
        }
    }

    renderImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        this.container.appendChild(canvas); // Append canvas to the specified container
        this.canvas = canvas;
        this.ctx = ctx;
        this.setupCanvasEvents();

        // Draw predefined points
        this.points.forEach(point => this.drawPoint(point));
        this.setupPointClickEvents();
        this.setupHoverEvents();
    }

    setupCanvasEvents() {
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            // Check if a point was clicked
            const clickedPoint = this.points.find(point => {
                const dx = x - point.x;
                const dy = y - point.y;
                return Math.sqrt(dx * dx + dy * dy) <= 10; // 10px radius for click detection
            });

            // If a point was clicked, do not create a new one
            if (clickedPoint) {
                return;
            }

            const data = prompt("Enter damage description:");
            if (data) {
                this.addPoint(x, y, data);
            }
        });
    }

    setupPointClickEvents() {
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            // Check if a point was clicked
            const clickedPoint = this.points.find(point => {
                const dx = x - point.x;
                const dy = y - point.y;
                return Math.sqrt(dx * dx + dy * dy) <= 10; // 10px radius for click detection
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
            this.onPointAdded(point, this.points);
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
        // Draw the point
        this.ctx.fillStyle = point.id === this.selectedPointId ? 'blue' : 'red'; // Highlight selected point in blue
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 10, 0, Math.PI * 2); // Larger radius for better visibility
        this.ctx.fill();

        // Draw the point ID
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(point.id, point.x, point.y);
    }

    redrawPoints() {
        // Clear the canvas and redraw all points
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const img = new Image();
        img.src = this.imageUrl;
        img.onload = () => {
            this.ctx.drawImage(img, 0, 0);
            this.points.forEach(point => this.drawPoint(point));
        };
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

export default Annotator;