export function validateImageUrl(url) {
    const pattern = /\.(jpeg|jpg|gif|png|svg)$/i;
    return pattern.test(url);
}

export function formatAnnotationData(data) {
    return {
        description: data.description || '',
        image: data.image || null,
        timestamp: new Date().toISOString(),
    };
}

export function calculateCanvasCoordinates(canvas, x, y) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: x - rect.left,
        y: y - rect.top,
    };
}