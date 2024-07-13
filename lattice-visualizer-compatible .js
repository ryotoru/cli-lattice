import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import open from 'open';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const argv = yargs(hideBin(process.argv))
  .option('dimension', {
    alias: 'd',
    description: 'Set the dimension of the lattice',
    type: 'number',
    default: 3,
  })
  .option('sumLimit', {
    alias: 's',
    description: 'Set the sum limit for the lattice points',
    type: 'number',
    default: 5,
  })
  .help()
  .alias('help', 'h')
  .argv;

const dimension = argv.dimension;
const sumLimit = argv.sumLimit;

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lattice Visualization</title>
  <style>
    body { margin: 0; overflow: hidden; }
    canvas { display: block; }
    #log {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(255, 255, 255, 0.8);
      padding: 10px;
      border-radius: 5px;
      max-width: 300px;
      word-wrap: break-word;
      z-index: 1000;
    }
  </style>
</head>
<body>
  <div id="log"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/OrbitControls.min.js"></script>
  <script>
    const log = (message) => {
      const logDiv = document.getElementById('log');
      logDiv.innerHTML += \`\${message}<br>\`;
      console.log(message);
    };

    const generateLatticePoints = (dimension, sumLimit) => {
      const points = [];
      const range = Array.from({ length: 2 * sumLimit + 1 }, (_, i) => i - sumLimit);

      const cartesianProduct = (...arrays) => arrays.reduce((acc, array) => (
        acc.flatMap(x => array.map(y => [...x, y]))
      ), [[]]);

      const coefficients = cartesianProduct(...Array(dimension).fill(range));

      const MAX_POINTS = 100000;
      if (coefficients.length > MAX_POINTS) {
        coefficients.length = MAX_POINTS;
      }

      for (const coeff of coefficients) {
        const point = new Array(dimension).fill(0);
        for (let i = 0; i < dimension; i++) {
          for (let j = 0; j < dimension; j++) {
            point[j] += coeff[i] * (i === j ? 1 : 0);
          }
        }
        points.push(point);
      }

      log(\`Generated \${points.length} lattice points\`);
      log(\`First few points: \${JSON.stringify(points.slice(0, 5))}\`);
      return points;
    };

    const renderLattice = (dimension, sumLimit) => {
      const points = generateLatticePoints(dimension, sumLimit);

      if (points.length === 0) {
        log('No points generated');
        return;
      }

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      const controls = new THREE.OrbitControls(camera, renderer.domElement);

      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(points.flat());
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        color: 0x00ff00,  // Bright green
        size: 0.5,        // Increased size
        sizeAttenuation: false
      });

      const pointCloud = new THREE.Points(geometry, material);
      scene.add(pointCloud);

      log(\`Added point cloud to the scene with \${points.length} points.\`);

      const axesHelper = new THREE.AxesHelper(sumLimit);
      scene.add(axesHelper);

      const maxCoord = Math.max(...positions) * 1.5;
      camera.position.set(maxCoord, maxCoord, maxCoord);
      camera.lookAt(scene.position);

      log(\`Camera positioned at: (\${camera.position.x}, \${camera.position.y}, \${camera.position.z})\`);

      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };

      animate();

      // Save PNG button
      const saveButton = document.createElement('button');
      saveButton.innerText = 'Save as PNG';
      saveButton.style.position = 'absolute';
      saveButton.style.top = '10px';
      saveButton.style.right = '10px';
      document.body.appendChild(saveButton);

      saveButton.addEventListener('click', () => {
        renderer.domElement.toBlob(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'lattice.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
      });
    };

    renderLattice(${dimension}, ${sumLimit});
  </script>
</body>
</html>
`;

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)){
    fs.mkdirSync(publicDir);
}
fs.writeFileSync(path.join(publicDir, 'index.html'), htmlContent);

const app = express();
let port = 3000;

app.use(express.static(publicDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const startServer = () => {
  const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Visualizing ${dimension}-dimensional lattice with sum limit ${sumLimit}`);
    open(`http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying another port...`);
      port += 1;
      startServer();
    } else {
      console.error(err);
    }
  });

  process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
};

startServer();
