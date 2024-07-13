#cli-lattice
# Lattice Visualization Tool

This tool visualizes high-dimensional lattices and their duals using Three.js. It allows for the generation of lattice points, visualization of the fundamental parallelepiped, and visualization of the dual lattice.

## Features

- Generate and visualize lattice points.
- Add and remove fundamental parallelepipeds.
- Visualize the dual lattice.


## Installation

1. **Clone the repository:**

    ```sh
    git clone https://github.com/your-username/your-repository-name.git
    cd your-repository-name
    ```

2. **Install dependencies:**

    Ensure you have [Node.js](https://nodejs.org/) installed. Then run:

    ```sh
    npm install
    ```

## Usage

1. **Run the server:**

    ```sh
    node lattice-visualizer.mjs --dimension <dimension> --sumLimit <sumLimit>
    ```

    Replace `<dimension>` with the desired dimension of the lattice and `<sumLimit>` with the sum limit for the lattice points. For example:

    ```sh
    node lattice-visualizer.mjs --dimension 3 --sumLimit 5

    ```
    ```sh
    node lattice-visualizer.mjs -d 3 -s 5
    ```
    Note: The number of points generated is restricted to 1000000000. You can change it depending on your device's capability by changng the value of MAX_POINTS. 

2. **Open the visualization:**

    The server will start at `http://localhost:3000`. Open this URL in your web browser to view the lattice visualization.

## Features and Controls

- **Add Fundamental Parallelepiped:** Adds a fundamental parallelepiped using random lattice points.
- **Remove Parallelepiped:** Removes the last added fundamental parallelepiped.
- **Visualize Dual Lattice:** Prompts for a basis and visualizes the dual lattice.
- **Show Original Lattice:** Reverts back to showing the original lattice points.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
