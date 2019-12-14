const dropZone = document.getElementById('app');
if (dropZone) {
    const hoverClassName = "hover";

    // Handle drag* events to handle style
    // Add the css you want when the class "hover" is present
    dropZone.addEventListener("dragenter", function (e) {
        e.preventDefault();
        dropZone.classList.add(hoverClassName);
    });

    dropZone.addEventListener("dragover", function (e) {
        e.preventDefault();
        dropZone.classList.add(hoverClassName);
    });

    dropZone.addEventListener("dragleave", function (e) {
        e.preventDefault();
        dropZone.classList.remove(hoverClassName);
    });

    // This is the most important event, the event that gives access to files
    dropZone.addEventListener("drop", function (e: DragEvent) {
        if (e !== null) {
            e.preventDefault();
            dropZone.classList.remove(hoverClassName);
            const fromDataTransfer = e && e.dataTransfer && e.dataTransfer.files || [];
            const files = Array.from(fromDataTransfer);
            console.log(files);
            if (files.length > 0) {
                const data = new FormData();
                for (const file of files) {
                    data.append('csv', file);
                }

                fetch('/portfolio', {
                    method: 'POST',
                    body: data
                })
                .then(() => console.log("file uploaded"))
                .catch(reason => console.error(reason));
            }
        }
    });
}