import * as fromStore from './store';

import { renderTodos } from './utils';

const input = document.querySelector('input') as HTMLInputElement;
const button = document.querySelector('button') as HTMLButtonElement;
const destroy = document.querySelector('.unsubscribe') as HTMLButtonElement;
const todoList = document.querySelector('.todos') as HTMLLIElement;

const reducers = {
    todos: fromStore.reducer,
};

const store = new fromStore.Store(reducers);

button.addEventListener(
    'click',
    () => {
        if (!input.value.trim()) return;

        const todo = { label: input.value, complete: false };

        store.dispatch(new fromStore.AddTodo(todo));

        input.value = '';
    },
    false
);

const unsubscribe = store.subscribe((state: any) => {
    renderTodos(state.todos.data);
});

destroy.addEventListener('click', unsubscribe, false);

todoList.addEventListener('click', function (event) {
    const target = event.target as HTMLButtonElement;
    if (target.nodeName.toLowerCase() === 'button') {
        const todo = JSON.parse(target.getAttribute('data-todo') as any);
        store.dispatch(new fromStore.RemoveTodo(todo));
    }
});

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

store.subscribe((state: any) => console.log('STATE:::', state));