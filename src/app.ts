import * as fromStore from './store';
import { renderPortfolioSummary, renderTickers, renderStrategies } from './utils';

const button = document.querySelector('button') as HTMLButtonElement;
const reducers = {
    todos: fromStore.reducer,
};
const store = new fromStore.Store(reducers);

button.addEventListener('click', async () => {
    const selectedFiles = (<HTMLInputElement>document.getElementById('csv-file')).files;
    if (selectedFiles) {
        const data = new FormData();
        data.append('csv', selectedFiles[0]);
        try {
            const res: any = await fetch('/portfolio', {
                method: 'POST',
                body: data
            });
            const body = await res.json();
            store.dispatch(new fromStore.CreatePortfolio(body));
        } catch(error) {
            console.error(error);
        }
    }
}, false);

store.subscribe((state: any) => {
    console.log(state.todos.portfolio);
    const hasSummary = state.todos.portfolio.hasOwnProperty('summary');
    if (hasSummary) {
        const summary = state.todos.portfolio.summary
        renderPortfolioSummary(summary);
    }
    const hasTickers = state.todos.portfolio.hasOwnProperty('tickers');
    if (hasTickers) {
        const tickers = state.todos.portfolio.tickers;
        renderTickers(tickers);
    }
    const hasStrategies = state.todos.portfolio.hasOwnProperty('strategies');
    if (hasStrategies) {
        const strategies = state.todos.portfolio.strategies;
        renderStrategies(strategies);
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
    dropZone.addEventListener("drop", async (e: DragEvent) => {
        if (e !== null) {
            e.preventDefault();
            dropZone.classList.remove(hoverClassName);
            const fromDataTransfer = e && e.dataTransfer && e.dataTransfer.files || [];
            const files = Array.from(fromDataTransfer);
            if (files.length > 0) {
                const data = new FormData();
                for (let file of files) {
                    data.append('csv', file);
                }
                try {
                    const res: any = await fetch('/portfolio', {
                        method: 'POST',
                        body: data
                    });
                    const body = await res.json();
                    console.log(body);
                    store.dispatch(new fromStore.CreatePortfolio(body));
                } catch(error) {
                    console.error(error);
                }
            }
        }
    });
}

store.subscribe((state: any) => console.log('STATE:::', state));