const baseUrl = "https://api.escuelajs.co/api/v1/products";
const pageLimit = 9; // Number of products per page
let currentPage = 1;
let totalProducts = 0;
let totalPages = 1;

function fetchTotalProducts(callback) {
    $.ajax({
        url: baseUrl,
        method: "GET",
        data: { offset: 0, limit: 1 },
        success: function(products, textStatus, request) {
            // The API does not return total count, so fetch a big number and count.
            $.ajax({
                url: baseUrl,
                method: 'GET',
                data: { offset: 0, limit: 1000 }, // Hardcoded, reliable for up to 1000 products
                success: function(products) {
                    totalProducts = products.length;
                    totalPages = Math.ceil(totalProducts / pageLimit);
                    if (callback) callback();
                }
            });
        }
    });
}

// READ & RENDER products for current page
function loadProducts(page = 1) {
    let offset = (page - 1) * pageLimit;
    $.ajax({
        url: baseUrl + `?offset=${offset}&limit=${pageLimit}`,
        method: "GET",
        success: function(products) {
            let productListContainer = $('#product-list');
            productListContainer.empty();
            if(products.length === 0){
                productListContainer.html('<p class="text-center">No products found.</p>');
            }
            products.forEach(function(product) {
                let card = `<div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <img src="${(product.images&&product.images[0]) ? product.images[0] : ''}" class="card-img-top" alt="${product.title}">
                        <div class="card-body">
                            <h5 class="card-title">${product.title}</h5>
                            <p class="card-text">${product.description}</p>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                              <span class="badge bg-success">$${product.price}</span>
                            </div>
                            <button class="btn btn-sm btn-secondary me-2" onclick="editProduct(${product.id})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
                        </div>
                    </div>
                </div>`;
                productListContainer.append(card);
            });
            renderPagination();
        }
    });
}

function renderPagination() {
    let paginations = [$('#pagination'), $('#pagination-bottom')];
    paginations.forEach(function($pagination){
        $pagination.empty();
        if(totalPages <= 1) return;
        let prevClass = (currentPage === 1) ? "disabled" : "";
        let nextClass = (currentPage === totalPages) ? "disabled" : "";
        let prevBtn = `<li class="page-item ${prevClass}"><a class="page-link" href="#" data-page="${currentPage-1}">Previous</a></li>`;
        $pagination.append(prevBtn);
        for(let i = 1; i <= totalPages; i++){
            let active = (i === currentPage) ? "active" : "";
            let btn = `<li class="page-item ${active}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
            $pagination.append(btn);
        }
        let nextBtn = `<li class="page-item ${nextClass}"><a class="page-link" href="#" data-page="${currentPage+1}">Next</a></li>`;
        $pagination.append(nextBtn);
    });
}

$(document).on('click', '.pagination .page-link', function(e){
    e.preventDefault();
    let page = Number($(this).data('page'));
    if(!page || page===currentPage || page<1 || page>totalPages) return;
    currentPage = page;
    loadProducts(currentPage);
});

// CREATE product
$(document).on('submit', '#add-product-form', function(e) {
    e.preventDefault();
    $.ajax({
        url: baseUrl + "/",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            title: $("#title").val(),
            price: Number($("#price").val()),
            description: $("#description").val(),
            categoryId: Number($("#categoryId").val()),
            images: [$("#imageUrl").val()]
        }),
        success: function() {
            fetchTotalProducts(function(){
              loadProducts(currentPage);
            });
            $('#add-product-form')[0].reset();
        }
    });
});

// EDIT button click handler
window.editProduct = function(id) {
    $.ajax({
        url: baseUrl + '/' + id,
        method: 'GET',
        success: function(product) {
            $("#edit-id").val(product.id);
            $("#edit-title").val(product.title);
            $("#edit-price").val(product.price);
            $("#edit-description").val(product.description);
            $("#edit-categoryId").val(product.category.id);
            $("#edit-imageUrl").val((product.images&&product.images[0]) ? product.images[0] : '');
            var editModal = new bootstrap.Modal(document.getElementById('editModal'));
            editModal.show();
        }
    });
};

// UPDATE product
$(document).on('submit', '#edit-product-form', function(e) {
    e.preventDefault();
    var id = $('#edit-id').val();
    $.ajax({
        url: baseUrl + '/' + id,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({
            title: $('#edit-title').val(),
            price: Number($('#edit-price').val()),
            description: $('#edit-description').val(),
            categoryId: Number($('#edit-categoryId').val()),
            images: [$('#edit-imageUrl').val()]
        }),
        success: function() {
            loadProducts(currentPage);
            var editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            editModal.hide();
        }
    });
});

// DELETE product
window.deleteProduct = function(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    $.ajax({
        url: baseUrl + '/' + id,
        method: 'DELETE',
        success: function() {
            fetchTotalProducts(function(){
                if((currentPage-1)*pageLimit>=totalProducts-1 && currentPage>1) currentPage--;
                loadProducts(currentPage);
            });
        }
    });
};

// On page load
$(function() {
    fetchTotalProducts(function(){
        currentPage = 1;
        loadProducts(currentPage);
    });
});
