
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

export function smoothstep(t) {
    return t * t * (3 - 2 * t);
}

export function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left),
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top)
    };
}

export async function loadFileURI(filename) {

    const module = await import("./res_files/" + filename + ".js");
    return module.retrieveData();

}