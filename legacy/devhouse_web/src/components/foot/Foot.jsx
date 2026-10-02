import './foot.css'

const Foot = () => {
  return (
    <footer class="footer">
      <div class="section__padding">
      <div class="footer-container  dh__container">
        <div class="footer-left">
          <div class="social-icons">
            <a href="/instagram" class="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61576886176025&locale=vi_VN" class="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a href="/github" class="social-link" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a href="/youtube" class="social-link" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>

          <div class="footer-info">
            <p class="copyright">©2025 The Dev House.</p>
            <p class="copyright">All rights reserved.</p>
            <p class="developed-by">Developed by DevHouse</p>
          </div>

          <div class="footer-logo">
            <div class="logo-container">
          
              <span class="logo-text">DEV HOUSE GROUP INC</span>
            </div>
          </div>
        </div>

        
        <div class="footer-links">
          <div class="footer-column">
            <h3 class="column-title">Use Case</h3>
            <ul class="link-list">
              <li>
                <a href="/ui-design">UI Design</a>
              </li>
              <li>
                <a href="/ux-design">UX Design</a>
              </li>
              <li>
                <a href="/development-features">Development features</a>
              </li>
              <li>
                <a href="/design-systems">Design systems</a>
              </li>
              <li>
                <a href="/deploy-features">Deploy features</a>
              </li>
              <li>
                <a href="/design-process">Design process</a>
              </li>
              <li>
                <a href="/diagram-fix">Diagram fix</a>
              </li>
            </ul>
          </div>

          <div class="footer-column">
            <h3 class="column-title">Explore</h3>
            <ul class="link-list">
              <li>
                <a href="/design">Design</a>
              </li>
              <li>
                <a href="/prototyping">Prototyping</a>
              </li>
              <li>
                <a href="/development-features">Development features</a>
              </li>
              <li>
                <a href="/design-systems">Design systems</a>
              </li>
              <li>
                <a href="/collaboration-features">Collaboration features</a>
              </li>
              <li>
                <a href="/design-process">Design process</a>
              </li>
              <li>
                <a href="/figjam">FigJam</a>
              </li>
            </ul>
          </div>

          <div class="footer-column">
            <h3 class="column-title">Resources</h3>
            <ul class="link-list">
              <li>
                <a href="/blog">Blog</a>
              </li>
              <li>
                <a href="/best-practices">Best practices</a>
              </li>
              <li>
                <a href="/colors">Colors</a>
              </li>
              <li>
                <a href="/color-wheel">Color wheel</a>
              </li>
              <li>
                <a href="/support">Support</a>
              </li>
              <li>
                <a href="/developers">Developers</a>
              </li>
              <li>
                <a href="/resource-library">Resource library</a>
              </li>
            </ul>
          </div>
        </div>

      </div>
      </div>
    </footer>
  )
}

export default Foot