
export function createAndSetupCanvas (width, height) {
    const canvasElement = document.createElement("canvas");

    canvasElement.width = width;
    canvasElement.height = height;

    canvasElement.style.width = `${width}px`;
    canvasElement.style.height = `${height}px`;

    canvasElement.style.position = "absolute";
    canvasElement.style.top = "50%";
    canvasElement.style.left = "50%";
    canvasElement.style.transform = "translate(-50%, -50%)"

    canvasElement.style.backgroundColor = "black";

    document.body.appendChild(canvasElement);

    return canvasElement;
}
