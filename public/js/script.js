(() => {
  'use strict'
  
  // Form Validation
  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }
      form.classList.add('was-validated')
    },false);
  })

  // Category Filter Functionality
  const filterButtons = document.querySelectorAll('.filter');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');
      
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Navigate to the filtered listings
      if (category) {
        window.location.href = `/listings?category=${category}`;
      } else {
        window.location.href = `/listings`;
      }
    });
  });

  // Set active filter based on query parameter on page load
  const urlParams = new URLSearchParams(window.location.search);
  const activeCategory = urlParams.get('category');
  
  if (activeCategory) {
    filterButtons.forEach(btn => {
      if (btn.getAttribute('data-category') === activeCategory) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Search Bar Functionality
  const searchForm = document.querySelector('.nav-search');
  const searchInput = document.querySelector('.search-input');
  
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchQuery = searchInput.value.trim();
      
      if (searchQuery) {
        // Search by title, location, or country using a query parameter
        window.location.href = `/listings?search=${encodeURIComponent(searchQuery)}`;
      }
    });
  }
})()
