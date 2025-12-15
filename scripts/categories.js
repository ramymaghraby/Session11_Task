const catBaseUrl = "https://api.escuelajs.co/api/v1/categories";

// READ all categories
function loadCategories() {
    $.ajax({
        url: catBaseUrl,
        method: "GET",
        success: function(categories) {
            let tbody = $('#category-list');
            tbody.empty();
            categories.forEach((cat, idx) => {
                let row = `<tr>
                    <td>${cat.id}</td>
                    <td>${cat.name}</td>
                    <td><img src="${cat.image}" height="40"/></td>
                    <td>
                        <button class="btn btn-sm btn-secondary me-2" onclick="editCategory(${cat.id})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCategory(${cat.id})">Delete</button>
                    </td>
                </tr>`;
                tbody.append(row);
            });
        }
    });
}

// CREATE category
$('#add-category-form').submit(function(e) {
    e.preventDefault();
    $.ajax({
        url: catBaseUrl + "/",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            name: $("#cat-name").val(),
            image: $("#cat-image").val()
        }),
        success: function() {
            loadCategories();
            $('#add-category-form')[0].reset();
        }
    });
});

// Edit button handler
window.editCategory = function(id) {
    $.ajax({
        url: catBaseUrl + '/' + id,
        method: 'GET',
        success: function(cat) {
            $("#edit-cat-id").val(cat.id);
            $("#edit-cat-name").val(cat.name);
            $("#edit-cat-image").val(cat.image);
            var editModal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
            editModal.show();
        }
    });
};

// UPDATE category
$('#edit-category-form').submit(function(e) {
    e.preventDefault();
    var id = $('#edit-cat-id').val();
    $.ajax({
        url: catBaseUrl + '/' + id,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({
            name: $('#edit-cat-name').val(),
            image: $('#edit-cat-image').val()
        }),
        success: function() {
            loadCategories();
            var editModal = bootstrap.Modal.getInstance(document.getElementById('editCategoryModal'));
            editModal.hide();
        }
    });
});

// DELETE category
window.deleteCategory = function(id) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    $.ajax({
        url: catBaseUrl + '/' + id,
        method: 'DELETE',
        success: function() {
            loadCategories();
        }
    });
};

// On page load
$(function() {
    loadCategories();
});

