const toCurrency = (price, currency='rub') => {
    return new Intl.NumberFormat('ru-Ru', {
        currency: currency,
        style: 'currency'
    }).format(price);
};

const toDate = date => {
      return new Intl.DateTimeFormat('ru-Ru', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
      }).format(new Date(date));
};

document.querySelectorAll('.price').forEach((node) => {
    node.textContent = toCurrency(node.textContent);
});

document.querySelectorAll('.date').forEach((node) => {
    node.textContent = toDate(node.textContent);
});

// const $currency = document.querySelector('#currency');
// if ($currency) {
//     $currency.addEventListener('click', event => {
//         console.log(event);
//     })
// }
function currencyChange () {
    const currencyList = document.getElementById('currency');
    const data = currencyList.dataset;
    const index = document.getElementById('currency').selectedIndex;
    const csrf = data.csrf;
    const currentCurrencyId = data.currency;
    const coursePrice = data.price;
    const chossedCurrency = currencyList[index];

    if (chossedCurrency.value !== currentCurrencyId) {
        fetch(`/currency?newCurrencyId=${chossedCurrency.value}&oldCurrencyId=${currentCurrencyId}&coursePrice=${coursePrice}`, {
            method: 'POST',
            headers: {
                'X-XSRF-TOKEN': csrf
            }
        }).then(res => res.json())
          .then(data => {
              document.querySelectorAll('.price').forEach((node) => {
                  node.textContent = toCurrency(data.convertedPrice, data.shortTitle);
              });
              currencyList.dataset.currency = data.newCurrencyId;
              currencyList.dataset.price = data.convertedPrice;
          })
    }
}


const $card = document.querySelector('#cart');
if ($card) {
    $card.addEventListener('click', event => {
        if (event.target.classList.contains('js-remove')) {
            const id = event.target.dataset.id;
            const csrf = event.target.dataset.csrf;

            fetch('/cart/remove/' + id, {
                method: 'delete',
                headers: {
                    'X-XSRF-TOKEN': csrf
                }
            }).then(res => res.json())
              .then(cart => {
                  if (cart.courses.length) {
                      const html = cart.courses.map(c => {
                          return `
                            <tr>
                                <td>${c.title}</td>
                                <td>${c.count}</td>
                                <td>
                                    <button class="btn btn-small js-remove" data-id="${c.id}">Delete</button>
                                </td>
                            </tr>
                           `;
                      }).join('');
                      $card.querySelector('tbody').innerHTML = html;
                      $card.querySelector('.price').textContent = toCurrency(cart.price);
                  } else {
                      $card.innerHTML = '<p>Cart is empty</p>'
                  }
              });
        }
    })
}

M.Tabs.init(document.querySelectorAll('.tabs'));




