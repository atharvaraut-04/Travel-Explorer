/* ============================================================
   main.js – TravelExplorer
   All interactive functionality for index.html and destination
   pages. Each feature is guarded so it only runs when the
   relevant elements exist on the current page.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ----------------------------------------------------------
       1. Smooth Scrolling (index.html anchor links)
    ---------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ----------------------------------------------------------
       2. Hamburger Menu (mobile)
    ---------------------------------------------------------- */
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            navLinks.classList.toggle('open');
        });

        // Close menu when a nav link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
            });
        });
    }

    /* ----------------------------------------------------------
       3. Scroll-to-Top Button
    ---------------------------------------------------------- */
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ----------------------------------------------------------
       3. Scroll-in Animations (IntersectionObserver)
    ---------------------------------------------------------- */
    const animatableCards = document.querySelectorAll(
        '.destination-card, .package-card, .testimonial-card'
    );
    if (animatableCards.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        animatableCards.forEach(card => observer.observe(card));
    }

    /* ----------------------------------------------------------
       4. Search & Filter (index.html)
    ---------------------------------------------------------- */
    const searchInput       = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    const priceFilter       = document.getElementById('priceFilter');
    const regionFilter      = document.getElementById('regionFilter');
    const tripTypeFilter    = document.getElementById('tripTypeFilter');
    const sortFilter        = document.getElementById('sortFilter');
    const resetBtn          = document.getElementById('resetFilters');
    const resultsCount      = document.getElementById('resultsCount');

    if (searchInput) {
        const destinationCards = Array.from(document.querySelectorAll('.destination-card'));

        const allDestinations = destinationCards.map(card => ({
            name: card.querySelector('h3').textContent.trim(),
            description: card.querySelector('p').textContent.trim()
        }));

        function buildSuggestionHTML(list) {
            return list.map(dest =>
                `<div class="suggestion-item" data-name="${dest.name}">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                        <strong>${dest.name}</strong>
                        <small>${dest.description}</small>
                    </div>
                </div>`
            ).join('');
        }

        searchInput.addEventListener('input', function () {
            const term = this.value.toLowerCase();
            if (term.length > 0) {
                const matches = allDestinations.filter(d =>
                    d.name.toLowerCase().includes(term) ||
                    d.description.toLowerCase().includes(term)
                );
                searchSuggestions.innerHTML = matches.length
                    ? buildSuggestionHTML(matches)
                    : '<div class="suggestion-item no-results"><i class="fas fa-info-circle"></i> No destinations found</div>';
                searchSuggestions.style.display = 'block';
            } else {
                searchSuggestions.style.display = 'none';
            }
            filterAndSortDestinations();
        });

        searchInput.addEventListener('focus', function () {
            if (this.value.trim() === '') {
                searchSuggestions.innerHTML = buildSuggestionHTML(allDestinations);
                searchSuggestions.style.display = 'block';
            }
        });

        searchSuggestions.addEventListener('click', function (e) {
            const item = e.target.closest('.suggestion-item');
            if (item && item.dataset.name) {
                searchInput.value = item.dataset.name;
                searchSuggestions.style.display = 'none';
                filterAndSortDestinations();
            }
        });

        document.addEventListener('click', function (e) {
            if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
                searchSuggestions.style.display = 'none';
            }
        });

        function filterAndSortDestinations() {
            const searchTerm = searchInput.value.toLowerCase();
            const priceRange = priceFilter.value;
            const region     = regionFilter.value;
            const tripType   = tripTypeFilter.value;
            const sortBy     = sortFilter.value;

            let visible = destinationCards.filter(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const desc  = card.querySelector('p').textContent.toLowerCase();
                const matchesSearch = title.includes(searchTerm) || desc.includes(searchTerm);

                let matchesPrice = true;
                if (priceRange !== 'all') {
                    const cardPrice = parseInt(card.dataset.price);
                    const [min, max] = priceRange.split('-').map(Number);
                    matchesPrice = cardPrice >= min && cardPrice <= max;
                }

                const matchesRegion = region === 'all' || card.dataset.region === region;
                const matchesType   = tripType === 'all' || card.dataset.type === tripType;

                return matchesSearch && matchesPrice && matchesRegion && matchesType;
            });

            if (sortBy === 'price-low')   visible.sort((a, b) => parseInt(a.dataset.price)      - parseInt(b.dataset.price));
            if (sortBy === 'price-high')  visible.sort((a, b) => parseInt(b.dataset.price)      - parseInt(a.dataset.price));
            if (sortBy === 'rating')      visible.sort((a, b) => parseFloat(b.dataset.rating)   - parseFloat(a.dataset.rating));
            if (sortBy === 'popularity')  visible.sort((a, b) => parseFloat(b.dataset.popularity) - parseFloat(a.dataset.popularity));

            destinationCards.forEach(card => (card.style.display = 'none'));
            const grid = document.querySelector('.destination-grid');
            visible.forEach(card => {
                card.style.display = 'block';
                grid.appendChild(card);
            });

            const count = visible.length;
            const isFiltered = searchTerm || priceRange !== 'all' || region !== 'all' || tripType !== 'all' || sortBy !== 'default';
            resultsCount.textContent = `Showing ${count} destination${count !== 1 ? 's' : ''}`;
            resultsCount.style.display = isFiltered ? 'block' : 'none';

            setTimeout(() => {
                visible.forEach(card => {
                    card.classList.remove('animate-in');
                    setTimeout(() => card.classList.add('animate-in'), 10);
                });
            }, 50);
        }

        priceFilter.addEventListener('change', filterAndSortDestinations);
        regionFilter.addEventListener('change', filterAndSortDestinations);
        tripTypeFilter.addEventListener('change', filterAndSortDestinations);
        sortFilter.addEventListener('change', filterAndSortDestinations);

        resetBtn.addEventListener('click', () => {
            searchInput.value      = '';
            priceFilter.value      = 'all';
            regionFilter.value     = 'all';
            tripTypeFilter.value   = 'all';
            sortFilter.value       = 'default';
            searchSuggestions.style.display = 'none';
            filterAndSortDestinations();
        });

        filterAndSortDestinations();
    }

    /* ----------------------------------------------------------
       5. FAQ Accordion (index.html)
    ---------------------------------------------------------- */
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            item.querySelector('.faq-question').addEventListener('click', () => {
                faqItems.forEach(other => {
                    if (other !== item) other.classList.remove('active');
                });
                item.classList.toggle('active');
            });
        });
    }

    /* ----------------------------------------------------------
       6. Trip Cost Calculator (maldives.html)
    ---------------------------------------------------------- */
    const calcDays          = document.getElementById('calcDays');
    const calcTravelers     = document.getElementById('calcTravelers');
    const calcAccommodation = document.getElementById('calcAccommodation');
    const calcMealPlan      = document.getElementById('calcMealPlan');
    const addonDiving       = document.getElementById('addonDiving');
    const addonSpa          = document.getElementById('addonSpa');
    const addonPhotography  = document.getElementById('addonPhotography');

    if (calcDays) {
        const breakdownAccom  = document.getElementById('breakdownAccom');
        const breakdownMeals  = document.getElementById('breakdownMeals');
        const breakdownAddons = document.getElementById('breakdownAddons');
        const totalCost       = document.getElementById('totalCost');
        const perPersonCost   = document.getElementById('perPersonCost');

        function formatINR(amount) {
            return '₹' + amount.toLocaleString('en-IN');
        }

        function calculateTrip() {
            const days               = parseInt(calcDays.value) || 1;
            const travelers          = parseInt(calcTravelers.value) || 1;
            const accommodationNight = parseInt(calcAccommodation.value);
            const mealsDay           = parseInt(calcMealPlan.value);

            const accomCost  = accommodationNight * days * travelers;
            const mealsCost  = mealsDay * days * travelers;
            let   addonsCost = 0;

            if (addonDiving.checked)      addonsCost += parseInt(addonDiving.value) * travelers;
            if (addonSpa.checked)         addonsCost += parseInt(addonSpa.value)    * travelers;
            if (addonPhotography.checked) addonsCost += parseInt(addonPhotography.value);

            breakdownAccom.textContent  = formatINR(accomCost);
            breakdownMeals.textContent  = formatINR(mealsCost);
            breakdownAddons.textContent = formatINR(addonsCost);

            const total = accomCost + mealsCost + addonsCost;
            totalCost.textContent      = formatINR(total);
            perPersonCost.textContent  = formatINR(Math.round(total / travelers));
        }

        [calcDays, calcTravelers].forEach(el => el.addEventListener('input', calculateTrip));
        [calcAccommodation, calcMealPlan].forEach(el => el.addEventListener('change', calculateTrip));
        [addonDiving, addonSpa, addonPhotography].forEach(el => el.addEventListener('change', calculateTrip));

        calculateTrip();
    }

});
