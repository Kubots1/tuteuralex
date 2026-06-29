// =====================
// Navbar hamburger menu
// =====================
function toggleMenu() {
  const links = document.querySelector('.nav-links');
  links.classList.toggle('open');
}

// Close menu when a link is clicked (mobile)
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.remove('open');
    closeDropdown();
  });
});

// =====================
// Dropdown "Apprendre"
// =====================
const dropdownToggle = document.querySelector('.dropdown-toggle');
const dropdownMenu   = document.querySelector('.dropdown-menu');

function closeDropdown() {
  dropdownMenu?.classList.remove('open');
  dropdownToggle?.setAttribute('aria-expanded', 'false');
}

dropdownToggle?.addEventListener('click', e => {
  e.stopPropagation();
  const isOpen = dropdownMenu.classList.toggle('open');
  dropdownToggle.setAttribute('aria-expanded', isOpen);
});

document.addEventListener('click', () => closeDropdown());
dropdownMenu?.addEventListener('click', e => e.stopPropagation());

// =====================
// Active nav link highlight
// =====================
const currentPage = location.pathname.split('/').pop() || 'index.html';

document.querySelectorAll('.nav-links a, .dropdown-menu a').forEach(link => {
  const href = link.getAttribute('href') || '';
  const page = href.split('/').pop();
  if (page === currentPage) {
    link.classList.add('active');
    // Si le lien actif est dans le dropdown, marquer aussi le toggle
    if (link.closest('.dropdown-menu')) {
      dropdownToggle?.classList.add('active');
    }
  }
});
