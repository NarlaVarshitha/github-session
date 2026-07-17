// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar on mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Modal functionality
    const modals = document.querySelectorAll('.modal');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    
    // Open modal
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Close modal
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
    
    // Add product button
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            openModal('addProductModal');
        });
    }
    
    // Close modal when clicking close button
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Close modal when clicking outside
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
    
    // Prevent form submission for demo
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Form submitted (demo)');
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Image upload preview
    const imageUploads = document.querySelectorAll('.image-upload input[type="file"]');
    imageUploads.forEach(input => {
        input.addEventListener('change', function() {
            const uploadArea = this.closest('.upload-area');
            if (this.files && this.files.length > 0) {
                uploadArea.innerHTML = '';
                
                Array.from(this.files).forEach(file => {
                    if (file.type.match('image.*')) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const img = document.createElement('img');
                            img.src = e.target.result;
                            img.style.maxWidth = '100px';
                            img.style.maxHeight = '100px';
                            img.style.margin = '5px';
                            uploadArea.appendChild(img);
                        };
                        reader.readAsDataURL(file);
                    }
                });
                
                if (uploadArea.children.length === 0) {
                    uploadArea.innerHTML = '<p>No images selected</p>';
                }
            }
        });
    });
    
    // Order status change
    const statusSelects = document.querySelectorAll('.status-select');
    statusSelects.forEach(select => {
        select.addEventListener('change', function() {
            // In a real app, you would send an AJAX request to update the status
            console.log(`Order status changed to ${this.value}`);
        });
    });
    
    // View order details
    const viewOrderBtns = document.querySelectorAll('.action-btn .fa-eye');
    viewOrderBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            openModal('orderDetailModal');
        });
    });
});