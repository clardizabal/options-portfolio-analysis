const portfolio = document.querySelector('.portfolio') as HTMLLIElement;

// Use this to render a list of elements
export function renderPortfolio(portfolio: any) {
  portfolio.innerHTML = '';
  console.log(portfolio);
}