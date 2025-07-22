# Image Annotator Library

The `image-annotator-lib` is a JavaScript library for annotating images. It allows users to add points with descriptions, interact with points, and export the annotated image.

---

## API Reference

### Constructor
```javascript
const annotator = new Annotator(imageUrl, onPointAdded, initialPoints);
```
- **`imageUrl`** (string): The URL of the image to annotate.
- **`onPointAdded`** (function): Callback triggered when a point is added.
- **`initialPoints`** (array): Array of predefined points, each with `id`, `x`, `y`, and `data`.

### Methods
- **`addPoint(x, y, data)`**: Add a new point to the image.
  - `x` (number): X-coordinate of the point.
  - `y` (number): Y-coordinate of the point.
  - `data` (string): Description or additional data for the point.
- **`deletePoint(pointId)`**: Delete a point by its ID.
  - `pointId` (number): The ID of the point to delete.
- **`exportImage()`**: Export the annotated image and trigger download.
- **`exportImageAsBase64()`**: Export the annotated image as base64 data URL.
- **`getAnnotatedImageBase64()`**: Get the annotated image as base64 data URL using current instance data.

### Static Methods
- **`Annotator.createAnnotatedImageBase64(imageUrl, points)`**: Create annotated image from URL and points data.
  - `imageUrl` (string): The URL of the image to annotate.
  - `points` (array): Array of points, each with `id`, `x`, `y`, and `data`.
  - Returns: Promise that resolves to base64 data URL.
  - Works in both browser and Node.js environments.

### Callbacks
- **`onPointAdded(point, points)`**: Triggered when a point is added.
  - `point` (object): The newly added point.
  - `points` (array): The updated list of all points.
- **`onPointClicked(point)`**: Triggered when a point is clicked.
  - `point` (object): The clicked point.

---

## Example Usage (CDN)

Include the library in your project using jsDelivr:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Image Annotator Example</title>
</head>
<body>
  <h1>Image Annotator Example</h1>
  <div id="points-container">
    <h2>Collected Points:</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>X Coordinate</th>
          <th>Y Coordinate</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody id="points-table-body"></tbody>
    </table>
  </div>
  <button id="export-button">Export Image</button>

  <script src="https://cdn.jsdelivr.net/gh/jkb-novak-birne/image-annotator-lib/dist/image-annotator-lib.js"></script>
  <script>
    const Annotator = ImageAnnotatorLib.Annotator;

    const annotator = new Annotator('https://example.com/image.png', null, [
      { id: 1, x: 50, y: 50, data: 'Point 1' },
      { id: 2, x: 150, y: 100, data: 'Point 2' }
    ]);

    annotator.onPointAdded = (point, points) => {
      console.log('Point added:', point);
    };

    annotator.onPointClicked = (point) => {
      console.log('Point clicked:', point);
    };

    document.getElementById('export-button').addEventListener('click', async () => {
      await annotator.exportImage();
    });

    // Example: Get base64 from instance
    const base64Instance = await annotator.getAnnotatedImageBase64();
    console.log('Base64 from instance:', base64Instance);

    // Example: Get base64 using static method
    const base64Static = await Annotator.createAnnotatedImageBase64(
      'https://example.com/image.png',
      [
        { id: 1, x: 50, y: 50, data: 'Point 1' },
        { id: 2, x: 150, y: 100, data: 'Point 2' }
      ]
    );
    console.log('Base64 from static method:', base64Static);
  </script>
</body>
</html>

---

## Server-Side Usage (Node.js)

For server-side image annotation, you can use the static method without DOM dependencies:

### Installation
```bash
npm install canvas  # Required for Node.js canvas support
```

### Example
```javascript
const Annotator = require('./src/annotator.js');

async function createAnnotatedImage() {
  try {
    const base64Image = await Annotator.createAnnotatedImageBase64(
      'https://example.com/image.jpg',
      [
        { id: 1, x: 100, y: 150, data: 'First point' },
        { id: 2, x: 200, y: 250, data: 'Second point' }
      ]
    );
    
    console.log('Annotated image as base64:', base64Image);
    
    // You can now save to file, send via API, etc.
    const fs = require('fs');
    const base64Data = base64Image.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync('annotated-image.png', base64Data, 'base64');
  } catch (error) {
    console.error('Error creating annotated image:', error);
  }
}

createAnnotatedImage();
```