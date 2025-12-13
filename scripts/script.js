$(function(){
    const productsApiUrl = "https://api.escuelajs.co/api/v1/products?offset=0&limit=9";
    $.get(productsApiUrl, function(products){
        console.log(products);
        
        var productListContainer = $('#product-list');
        products.forEach(function(product){
            var productCard = `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <img src="${product.images[0]}" class="card-img-top" alt="${product.title}">
                        <div class="card-body">
                            <h5 class="card-title">${product.title}</h5>
                            <p class="card-text">$${product.price}</p>
                            <a href="#" class="btn btn-primary">Buy Now</a>
                        </div>
                    </div>
                </div>
            `;
            productListContainer.append(productCard);
        });
    });
});