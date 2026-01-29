
class CinemaApp {
    constructor() {
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        this.apiKey = '41481a4';
        this.kpiChartInstance = null;
        this.kpiDonutInstance = null;
        this.localMovies = [];
        this.localFilters = { genre: '', yearFrom: null, yearTo: null, minRating: null };
        this.apiFilters = { yearFrom: null, yearTo: null, minRating: null };
        this.favFilters = { genre: '', minRating: null };
        this.localDirectors = [];
        this.lastApiMovies = [];
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupSearch();
        this.loadRandomMovies();
        this.loadDirectors();
        this.updateFavoritesCount();
        this.displayFavorites();
        this.initKPIChart();
        // employees module removed
        this.loadLocalMovies();
        this.initLocalMovieModule();
        this.initFilters();
        this.loadLocalDirectors();
        this.initLocalDirectorModule();
        this.updateDashboard();
        this.setupEventListeners();
        this.setupCursorGlow();
    }

    // Navigation
    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
                
                link.classList.add('active');
                document.getElementById(targetId)?.classList.add('active');
            });
        });
        document.querySelector('a[href="#home"]').classList.add('active');
    }

    // Search
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        const performSearch = async () => {
            const query = searchInput.value.trim();
            if (!query) return;

            const movies = await this.searchMovies(query);
            this.displayMovies(movies, 'movies');
            
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
            document.getElementById('search-results').classList.add('active');
        };

        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && performSearch());
    }

    // OMDb API endpoints
    async searchMovies(query) {
        try {
            const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${this.apiKey}`);
            const data = await response.json();
            console.log('OMDb Response:', data);
            
            if (data.Search) {
                return data.Search.slice(0, 6).map(this.formatMovie);
            }
            return [];
        } catch (error) {
            console.error('OMDb API Error:', error);
            return [];
        }
    }

    async getRandomMovies() {
        try {
            console.log('Fetching movies from OMDb...');
            // Get truly random movies from different categories
            const searches = ['action', 'comedy', 'drama', 'horror', 'sci-fi', 'thriller', 'romance', 'animation', 'crime', 'fantasy'];
            const randomSearch = searches[Math.floor(Math.random() * searches.length)];
            const randomPage = Math.floor(Math.random() * 5) + 1; // Random page 1-5
            
            const response = await fetch(`https://www.omdbapi.com/?s=${randomSearch}&page=${randomPage}&apikey=${this.apiKey}`);
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('API Response:', data);
            
            if (data.Search && data.Search.length > 0) {
                // Shuffle and take 6 random movies
                const results = data.Search.sort(() => Math.random() - 0.5).slice(0, 6).map(this.formatMovie);
                this.lastApiMovies = results;
                return results;
            } else {
                console.log('No results in API response');
                this.lastApiMovies = [];
                return [];
            }
        } catch (error) {
            console.error('API Error:', error);
            this.lastApiMovies = [];
            return [];
        }
    }

    async getMovieDetails(movieId) {
        // check local movies first
        const local = this.localMovies.find(m => m.id === movieId);
        if (local) return local;

        // otherwise query OMDb
        try {
            const response = await fetch(`https://www.omdbapi.com/?i=${movieId}&apikey=${this.apiKey}`);
            const data = await response.json();
            if (data.imdbID) {
                return this.formatMovie(data);
            }
        } catch (error) {
            console.error('API Error:', error);
        }
        return null;
    }

    formatMovie(movie) {
        return {
            id: movie.imdbID,
            title: movie.Title,
            year: movie.Year ? movie.Year.split('–')[0] : 'Unknown',
            director: movie.Director || 'Unknown',
            rating: movie.imdbRating || 0,
            poster: movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster',
            description: movie.Plot || 'No description available'
        };
    }

    // Local movies (user-created) CRUD
    loadLocalMovies() {
        this.localMovies = JSON.parse(localStorage.getItem('localMovies')) || [];
            // seed with 10 sample local movies if none exist
        if (!this.localMovies || this.localMovies.length === 0) {
            this.localMovies = [
                { id: 'local-1', title: 'Midnight City', director: 'A. Legrand', genre: 'Drama', year: '2019', rating: 7.8, poster: 'https://picsum.photos/seed/midnightcity/300/450', description: 'A moving indie drama set in neon-lit streets.' },
                { id: 'local-2', title: 'Skybound', director: 'R. Torres', genre: 'Action', year: '2021', rating: 8.2, poster: 'https://picsum.photos/seed/skybound/300/450', description: 'High-flying action with breathtaking stunts.' },
                { id: 'local-3', title: 'Laughter Lane', director: 'S. Kumar', genre: 'Comedy', year: '2017', rating: 6.9, poster: 'https://picsum.photos/seed/laughterlane/300/450', description: 'A light-hearted comedy about unexpected friendships.' },
                { id: 'local-4', title: 'Echoes', director: 'M. Rossi', genre: 'Horror', year: '2020', rating: 7.1, poster: 'https://picsum.photos/seed/echoes/300/450', description: 'A psychological horror that lingers long after.' },
                { id: 'local-5', title: 'Parallel Hearts', director: 'L. Chen', genre: 'Romance', year: '2018', rating: 7.4, poster: 'https://picsum.photos/seed/parallelhearts/300/450', description: 'A tender romance across parallel lives.' },
                { id: 'local-6', title: 'Neon Circuit', director: 'K. Okoye', genre: 'Sci-Fi', year: '2022', rating: 8.0, poster: 'https://picsum.photos/seed/neoncircuit/300/450', description: 'Futuristic cyber-thriller exploring identity.' },
                { id: 'local-7', title: 'Hidden Notes', director: 'F. Alvarez', genre: 'Drama', year: '2016', rating: 7.0, poster: 'https://picsum.photos/seed/hiddennotes/300/450', description: 'An intimate story told through music.' },
                { id: 'local-8', title: 'The Quiet Road', director: 'H. Nakamura', genre: 'Drama', year: '2015', rating: 6.8, poster: 'https://picsum.photos/seed/thequietroad/300/450', description: 'Road-trip drama about healing and memory.' },
                { id: 'local-9', title: 'Starlit Circus', director: 'P. Moreau', genre: 'Animation', year: '2014', rating: 8.5, poster: 'https://picsum.photos/seed/starlitcircus/300/450', description: 'Enchanting animated tale for all ages.' },
                { id: 'local-10', title: 'Broken Compass', director: 'E. Haddad', genre: 'Crime', year: '2023', rating: 7.6, poster: 'https://picsum.photos/seed/brokencompass/300/450', description: 'A gritty crime thriller with twists.' }
            ];
            this.saveLocalMovies();
        }
        this.renderLocalMovies();
    }

    saveLocalMovies() {
        localStorage.setItem('localMovies', JSON.stringify(this.localMovies));
    }

    initLocalMovieModule() {
        const form = document.getElementById('localMovieForm');
        if (form) form.addEventListener('submit', (e) => this.handleLocalMovieForm(e));
        // filter controls
        document.getElementById('applyLocalFilters')?.addEventListener('click', (e) => { e.preventDefault(); this.applyLocalFilters(); });
        document.getElementById('clearLocalFilters')?.addEventListener('click', (e) => { e.preventDefault(); this.clearLocalFilters(); });
        document.getElementById('filterGenre')?.addEventListener('change', () => this.updateLocalFiltersFromUI());
        document.getElementById('filterYearFrom')?.addEventListener('input', () => this.updateLocalFiltersFromUI());
        document.getElementById('filterYearTo')?.addEventListener('input', () => this.updateLocalFiltersFromUI());
        document.getElementById('filterMinRating')?.addEventListener('input', () => this.updateLocalFiltersFromUI());
        this.renderLocalMovies();
    }

    // Initialize API & Favorites filter controls
    initFilters() {
        // API / Films filters
        document.getElementById('applyApiFilters')?.addEventListener('click', (e) => { e.preventDefault(); this.applyApiFilters(); });
        document.getElementById('clearApiFilters')?.addEventListener('click', (e) => { e.preventDefault(); this.clearApiFilters(); });
        document.getElementById('apiFilterYearFrom')?.addEventListener('input', () => this.updateApiFiltersFromUI());
        document.getElementById('apiFilterYearTo')?.addEventListener('input', () => this.updateApiFiltersFromUI());
        document.getElementById('apiFilterMinRating')?.addEventListener('input', () => this.updateApiFiltersFromUI());

        // Favorites filters
        document.getElementById('applyFavFilters')?.addEventListener('click', (e) => { e.preventDefault(); this.applyFavFilters(); });
        document.getElementById('clearFavFilters')?.addEventListener('click', (e) => { e.preventDefault(); this.clearFavFilters(); });
        document.getElementById('favFilterGenre')?.addEventListener('change', () => this.updateFavFiltersFromUI());
        document.getElementById('favFilterMinRating')?.addEventListener('input', () => this.updateFavFiltersFromUI());
    }

    handleLocalMovieForm(e) {
        e.preventDefault();
        const idEl = document.getElementById('localEditId');
        const titleEl = document.getElementById('localTitle');
        const dirEl = document.getElementById('localDirector');
        const genreEl = document.getElementById('localGenre');
        const yearEl = document.getElementById('localYear');
        const ratingEl = document.getElementById('localRating');
        const posterEl = document.getElementById('localPoster');
        const descEl = document.getElementById('localDescription');

        if (!titleEl) return;
        const title = titleEl.value.trim();
        if (!title) return;
        // If editing an existing local movie, allow manual update
        if (idEl && idEl.value) {
            const movieObj = {
                id: idEl.value,
                title,
                director: dirEl?.value || 'Unknown',
                genre: genreEl?.value || '',
                year: yearEl?.value || 'Unknown',
                rating: ratingEl && ratingEl.value ? parseFloat(ratingEl.value) : null,
                poster: posterEl?.value || 'https://via.placeholder.com/300x450?text=No+Poster',
                description: descEl?.value || ''
            };
            const idx = this.localMovies.findIndex(m => m.id === idEl.value);
            if (idx > -1) this.localMovies[idx] = movieObj;
            this.saveLocalMovies();
            this.renderLocalMovies();
            if (idEl) idEl.value = '';
            titleEl.value = '';
            if (dirEl) dirEl.value = '';
            if (genreEl) genreEl.value = '';
            if (yearEl) yearEl.value = '';
            if (ratingEl) ratingEl.value = '';
            if (posterEl) posterEl.value = '';
            if (descEl) descEl.value = '';
            return;
        }

        // Adding new local movie: try to fetch full details from OMDb by exact title first
        const fetchByTitle = (t) => fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(t)}&apikey=${this.apiKey}`).then(res => res.json());
        const fetchBySearch = (t) => fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(t)}&apikey=${this.apiKey}`).then(res => res.json());

        fetchByTitle(title)
            .then(data => {
                if (data && data.Response !== 'False' && data.Title) {
                    // got full details
                    const movieObj = {
                        id: data.imdbID || 'local-' + Date.now(),
                        title: data.Title,
                        director: data.Director || dirEl?.value || 'Unknown',
                        genre: data.Genre ? data.Genre.split(',')[0].trim() : (genreEl?.value || ''),
                        year: data.Year || (yearEl?.value || 'Unknown'),
                        rating: data.imdbRating && data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : (ratingEl && ratingEl.value ? parseFloat(ratingEl.value) : null),
                        poster: data.Poster && data.Poster !== 'N/A' ? data.Poster : (posterEl?.value || 'https://via.placeholder.com/300x450?text=No+Poster'),
                        description: data.Plot && data.Plot !== 'N/A' ? data.Plot : (descEl?.value || '')
                    };
                    this.localMovies.push(movieObj);
                    this.saveLocalMovies();
                    this.renderLocalMovies();
                    // clear form
                    titleEl.value = '';
                    if (dirEl) dirEl.value = '';
                    if (genreEl) genreEl.value = '';
                    if (yearEl) yearEl.value = '';
                    if (ratingEl) ratingEl.value = '';
                    if (posterEl) posterEl.value = '';
                    if (descEl) descEl.value = '';
                    this.updateDashboard();
                } else {
                    // fallback to search and get first result details
                    return fetchBySearch(title).then(sdata => {
                        if (sdata && sdata.Search && sdata.Search.length > 0) {
                            const first = sdata.Search[0];
                            return fetch(`https://www.omdbapi.com/?i=${first.imdbID}&apikey=${this.apiKey}`).then(res => res.json()).then(details => details);
                        }
                        throw new Error('No results');
                    }).then(details => {
                        if (details && details.Response !== 'False') {
                            const movieObj = {
                                id: details.imdbID || 'local-' + Date.now(),
                                title: details.Title,
                                director: details.Director || dirEl?.value || 'Unknown',
                                genre: details.Genre ? details.Genre.split(',')[0].trim() : (genreEl?.value || ''),
                                year: details.Year || (yearEl?.value || 'Unknown'),
                                rating: details.imdbRating && details.imdbRating !== 'N/A' ? parseFloat(details.imdbRating) : (ratingEl && ratingEl.value ? parseFloat(ratingEl.value) : null),
                                poster: details.Poster && details.Poster !== 'N/A' ? details.Poster : (posterEl?.value || 'https://via.placeholder.com/300x450?text=No+Poster'),
                                description: details.Plot && details.Plot !== 'N/A' ? details.Plot : (descEl?.value || '')
                            };
                            this.localMovies.push(movieObj);
                            this.saveLocalMovies();
                            this.renderLocalMovies();
                            // clear form
                            titleEl.value = '';
                            if (dirEl) dirEl.value = '';
                            if (genreEl) genreEl.value = '';
                            if (yearEl) yearEl.value = '';
                            if (ratingEl) ratingEl.value = '';
                            if (posterEl) posterEl.value = '';
                            if (descEl) descEl.value = '';
                            this.updateDashboard();
                        } else {
                            console.warn('OMDb: No details found for', title);
                            // as last resort, save minimal local movie
                            const movieObj = {
                                id: 'local-' + Date.now(),
                                title,
                                director: dirEl?.value || 'Unknown',
                                genre: genreEl?.value || '',
                                year: yearEl?.value || 'Unknown',
                                rating: ratingEl && ratingEl.value ? parseFloat(ratingEl.value) : null,
                                poster: posterEl?.value || 'https://via.placeholder.com/300x450?text=No+Poster',
                                description: descEl?.value || ''
                            };
                            this.localMovies.push(movieObj);
                            this.saveLocalMovies();
                            this.renderLocalMovies();
                            // clear form
                            titleEl.value = '';
                        }
                    });
                }
            })
            .catch(err => {
                console.error('Error fetching OMDb for local movie:', err);
                // fallback: save minimal local movie
                const movieObj = {
                    id: 'local-' + Date.now(),
                    title,
                    director: dirEl?.value || 'Unknown',
                    genre: genreEl?.value || '',
                    year: yearEl?.value || 'Unknown',
                    rating: ratingEl && ratingEl.value ? parseFloat(ratingEl.value) : null,
                    poster: posterEl?.value || 'https://via.placeholder.com/300x450?text=No+Poster',
                    description: descEl?.value || ''
                };
                this.localMovies.push(movieObj);
                this.saveLocalMovies();
                this.renderLocalMovies();
                // clear form
                titleEl.value = '';
            });
    }

    renderLocalMovies() {
        const container = document.getElementById('local-movies');
        if (!container) return;

        if (this.localMovies.length === 0) {
            container.innerHTML = '<div class="empty-state">No local movies yet. Create one!</div>';
            return;
        }

        const filtered = this.localMovies.filter(m => this.passesLocalFilters(m));

        container.innerHTML = filtered.map(movie => `
            <div class="movie local-movie">
                <div class="movie-poster-container">
                    <img src="${movie.poster}" alt="${movie.title}" loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x450?text=No+Image'">
                    ${this.favorites.some(fav => fav.id === movie.id) ? '<div class="favorite-badge"><i class="fas fa-heart"></i></div>' : ''}
                </div>
                <h3>${movie.title}</h3>
                <p><strong>${movie.year}</strong> • ${movie.genre ? movie.genre : ''} ${movie.rating ? '• ⭐ ' + movie.rating : ''}</p>
                <p>Director: ${movie.director}</p>
                <p>${movie.description}</p>
                <div class="movie-actions">
                    <button onclick="cinemaApp.showMovieDetails('${movie.id}')">Details</button>
                    <button data-id="${movie.id}" class="edit-local">Edit</button>
                    <button data-id="${movie.id}" class="delete-local">Delete</button>
                </div>
            </div>
        `).join('');

        // attach edit/delete handlers
        container.querySelectorAll('.edit-local').forEach(btn => {
            btn.addEventListener('click', () => this.editLocalMovie(btn.getAttribute('data-id')));
        });
        container.querySelectorAll('.delete-local').forEach(btn => {
            btn.addEventListener('click', () => this.deleteLocalMovie(btn.getAttribute('data-id')));
        });
    }

    editLocalMovie(id) {
        const movie = this.localMovies.find(m => m.id === id);
        if (!movie) return;
        document.getElementById('localEditId').value = movie.id;
        document.getElementById('localTitle').value = movie.title;
        document.getElementById('localDirector').value = movie.director;
        document.getElementById('localYear').value = movie.year;
        document.getElementById('localPoster').value = movie.poster;
        document.getElementById('localDescription').value = movie.description;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    deleteLocalMovie(id) {
        this.localMovies = this.localMovies.filter(m => m.id !== id);
        this.saveLocalMovies();
        this.renderLocalMovies();
        // also remove from favorites if present
        const before = this.favorites.length;
        this.favorites = this.favorites.filter(f => f.id !== id);
        if (this.favorites.length !== before) {
            localStorage.setItem('favorites', JSON.stringify(this.favorites));
            this.updateFavoritesCount();
            this.displayFavorites();
        }
    }

    // Filters for local movies
    updateLocalFiltersFromUI() {
        const g = document.getElementById('filterGenre')?.value || '';
        const yf = document.getElementById('filterYearFrom')?.value || '';
        const yt = document.getElementById('filterYearTo')?.value || '';
        const mr = document.getElementById('filterMinRating')?.value || '';
        this.localFilters.genre = g;
        this.localFilters.yearFrom = yf ? parseInt(yf,10) : null;
        this.localFilters.yearTo = yt ? parseInt(yt,10) : null;
        this.localFilters.minRating = mr ? parseFloat(mr) : null;
    }

    // API filters
    updateApiFiltersFromUI() {
        const yf = document.getElementById('apiFilterYearFrom')?.value || '';
        const yt = document.getElementById('apiFilterYearTo')?.value || '';
        const mr = document.getElementById('apiFilterMinRating')?.value || '';
        this.apiFilters.yearFrom = yf ? parseInt(yf,10) : null;
        this.apiFilters.yearTo = yt ? parseInt(yt,10) : null;
        this.apiFilters.minRating = mr ? parseFloat(mr) : null;
    }

    passesApiFilters(movie) {
        const f = this.apiFilters;
        if (f.yearFrom && movie.year && parseInt(movie.year,10) < f.yearFrom) return false;
        if (f.yearTo && movie.year && parseInt(movie.year,10) > f.yearTo) return false;
        if (f.minRating && (movie.rating === undefined || movie.rating === null || movie.rating < f.minRating)) return false;
        return true;
    }

    applyApiFilters() { this.updateApiFiltersFromUI(); this.loadRandomMovies(); }
    clearApiFilters() { document.getElementById('apiFilterYearFrom').value=''; document.getElementById('apiFilterYearTo').value=''; document.getElementById('apiFilterMinRating').value=''; this.apiFilters = { yearFrom:null, yearTo:null, minRating:null }; this.loadRandomMovies(); }

    // Favorites filters
    updateFavFiltersFromUI() {
        const g = document.getElementById('favFilterGenre')?.value || '';
        const mr = document.getElementById('favFilterMinRating')?.value || '';
        this.favFilters.genre = g;
        this.favFilters.minRating = mr ? parseFloat(mr) : null;
    }

    passesFavFilters(movie) {
        const f = this.favFilters;
        if (f.genre && (!movie.genre || movie.genre.toLowerCase().indexOf(f.genre.toLowerCase()) === -1)) return false;
        if (f.minRating && (movie.rating === undefined || movie.rating === null || movie.rating < f.minRating)) return false;
        return true;
    }

    applyFavFilters() { this.updateFavFiltersFromUI(); this.displayFavorites(); }
    clearFavFilters() { document.getElementById('favFilterGenre').value=''; document.getElementById('favFilterMinRating').value=''; this.favFilters = { genre:'', minRating:null }; this.displayFavorites(); }

    passesLocalFilters(movie) {
        const f = this.localFilters;
        if (f.genre && movie.genre && movie.genre.toLowerCase().indexOf(f.genre.toLowerCase()) === -1) return false;
        if (f.yearFrom && parseInt(movie.year,10) < f.yearFrom) return false;
        if (f.yearTo && parseInt(movie.year,10) > f.yearTo) return false;
        if (f.minRating && (movie.rating === null || movie.rating < f.minRating)) return false;
        return true;
    }

    applyLocalFilters() {
        this.updateLocalFiltersFromUI();
        this.renderLocalMovies();
    }

    clearLocalFilters() {
        document.getElementById('filterGenre').value = '';
        document.getElementById('filterYearFrom').value = '';
        document.getElementById('filterYearTo').value = '';
        document.getElementById('filterMinRating').value = '';
        this.localFilters = { genre: '', yearFrom: null, yearTo: null, minRating: null };
        this.renderLocalMovies();
    }

    // Local directors persistence and CRUD
    loadLocalDirectors() {
        this.localDirectors = JSON.parse(localStorage.getItem('localDirectors')) || [];
    }

    saveLocalDirectors() {
        localStorage.setItem('localDirectors', JSON.stringify(this.localDirectors));
    }

    initLocalDirectorModule() {
        const form = document.getElementById('localDirectorForm');
        if (form) form.addEventListener('submit', (e) => this.handleLocalDirectorForm(e));
    }

    handleLocalDirectorForm(e) {
        e.preventDefault();
        const idEl = document.getElementById('localDirectorId');
        const nameEl = document.getElementById('dirName');
        const countEl = document.getElementById('dirMovieCount');
        const ratingEl = document.getElementById('dirAvgRating');
        const bioEl = document.getElementById('dirBio');
        if (!nameEl) return;
        const name = nameEl.value.trim();
        if (!name) return;

        const directorObj = {
            id: idEl && idEl.value ? idEl.value : 'ld-' + Date.now(),
            name,
            movieCount: countEl && countEl.value ? parseInt(countEl.value,10) : 0,
            avgRating: ratingEl && ratingEl.value ? parseFloat(ratingEl.value) : '-',
            bio: bioEl?.value || '',
            movies: []
        };

        if (idEl && idEl.value) {
            const idx = this.localDirectors.findIndex(d => d.id === idEl.value);
            if (idx > -1) this.localDirectors[idx] = directorObj;
        } else {
            this.localDirectors.push(directorObj);
        }

        this.saveLocalDirectors();
        // refresh directors display (loadDirectors will fetch API directors then call displayDirectors)
        this.loadDirectors();

        // reset form
        if (idEl) idEl.value = '';
        nameEl.value = '';
        if (countEl) countEl.value = '';
        if (ratingEl) ratingEl.value = '';
        if (bioEl) bioEl.value = '';
    }

    editLocalDirector(id) {
        const d = this.localDirectors.find(x => x.id === id);
        if (!d) return;
        document.getElementById('localDirectorId').value = d.id;
        document.getElementById('dirName').value = d.name;
        document.getElementById('dirMovieCount').value = d.movieCount || '';
        document.getElementById('dirAvgRating').value = d.avgRating || '';
        document.getElementById('dirBio').value = d.bio || '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    deleteLocalDirector(id) {
        this.localDirectors = this.localDirectors.filter(x => x.id !== id);
        this.saveLocalDirectors();
        this.loadDirectors();
    }


    // Display functions
    displayMovies(movies, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (movies.length === 0) {
            container.innerHTML = '<div class="empty-state">No movies found.</div>';
            return;
        }

        // apply API/films filters when displaying suggestions or search results
        let toShow = movies;
        if (containerId === 'movies-container' || containerId === 'movies') {
            toShow = movies.filter(m => this.passesApiFilters(m));
        }

        container.innerHTML = toShow.map(movie => `
            <div class="movie" onclick="cinemaApp.showMovieDetails('${movie.id}')">
                <div class="movie-poster-container">
                    <img src="${movie.poster}" alt="${movie.title}" loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x450?text=No+Image'">
                    ${this.favorites.some(fav => fav.id === movie.id) ? '<div class="favorite-badge"><i class="fas fa-heart"></i></div>' : ''}
                </div>
                <h3>${movie.title}</h3>
                <p><strong>${movie.year}</strong></p>
                <p>Director: ${movie.director}</p>
                <p>⭐ ${movie.rating}</p>
            </div>
        `).join('');
    }

    // Movie modal
    async showMovieDetails(movieId) {
        const movie = await this.getMovieDetails(movieId);
        if (!movie) {
            return;
        }

        const isFavorite = this.favorites.some(fav => fav.id === movieId);
        
        const modalHtml = `
            <div id="movieModal" class="show">
                <div class="modal-inner">
                    <button class="modal-close" onclick="cinemaApp.closeModal()">&times;</button>
                    <div style="display: flex; gap: 30px; flex-wrap: wrap;">
                        <img src="${movie.poster}" alt="${movie.title}" style="width: 200px; border-radius: 12px;" onerror="this.onerror=null;this.src='https://via.placeholder.com/200x300?text=No+Image'">
                        <div style="flex: 1;">
                            <h2 style="color: #ffcc00; margin-bottom: 15px;">${movie.title}</h2>
                            <p style="font-size: 18px; margin-bottom: 10px;"><strong>Year:</strong> ${movie.year}</p>
                            <p style="font-size: 18px; margin-bottom: 10px;"><strong>Director:</strong> ${movie.director}</p>
                            <p style="font-size: 18px; margin-bottom: 10px;"><strong>Rating:</strong> ⭐ ${movie.rating}</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">${movie.description}</p>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" onclick="cinemaApp.toggleFavorite('${movieId}')">
                            <i class="fas fa-heart"></i> ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('movieModal')?.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    closeModal() {
        document.getElementById('movieModal')?.remove();
    }

    // Favorites
    async toggleFavorite(movieId) {
        const movie = await this.getMovieDetails(movieId);
        if (!movie) {
            return;
        }

        const index = this.favorites.findIndex(fav => fav.id === movieId);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(movie);
        }

        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.updateFavoritesCount();
        this.displayFavorites();
        this.closeModal();
        this.loadRandomMovies();
    }

    displayFavorites() {
        const container = document.getElementById('favorites-list');
        if (!container) return;
        const filtered = this.favorites.filter(m => this.passesFavFilters(m));

        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state">No favorite movies yet. Start adding some!</div>';
            return;
        }

        container.innerHTML = filtered.map(movie => `
            <div class="movie" onclick="cinemaApp.showMovieDetails('${movie.id}')">
                <div class="movie-poster-container">
                    <img src="${movie.poster}" alt="${movie.title}" loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x450?text=No+Image'">
                    <div class="favorite-badge"><i class="fas fa-heart"></i></div>
                </div>
                <h3>${movie.title}</h3>
                <p><strong>${movie.year}</strong> ${movie.genre ? '• ' + movie.genre : ''}</p>
                <p>Director: ${movie.director}</p>
                <p>⭐ ${movie.rating ?? '-'}</p>
            </div>
        `).join('');
    }

    updateFavoritesCount() {
        const countElement = document.getElementById('favorites-count');
        if (countElement) {
            countElement.textContent = `${this.favorites.length} favorite${this.favorites.length !== 1 ? 's' : ''}`;
        }
    }

    // Directors
    async loadDirectors() {
        try {
            // Get movies from OMDb to extract directors
            const searches = ['avengers', 'batman', 'star wars', 'joker', 'matrix', 'inception'];
            const directorMap = new Map();
            
            for (const search of searches) {
                try {
                    const response = await fetch(`https://www.omdbapi.com/?s=${search}&apikey=${this.apiKey}`);
                    const data = await response.json();
                    
                    if (data.Search) {
                        for (const movie of data.Search.slice(0, 2)) {
                            try {
                                const detailsResponse = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${this.apiKey}`);
                                const details = await detailsResponse.json();
                                
                                if (details.Director && details.Director !== 'N/A') {
                                    const directors = details.Director.split(',').map(d => d.trim());
                                    
                                    directors.forEach(director => {
                                        if (!directorMap.has(director)) {
                                            directorMap.set(director, []);
                                        }
                                        directorMap.get(director).push(this.formatMovie(details));
                                    });
                                }
                            } catch (error) {
                                console.error('Error getting movie details:', error);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error searching movies:', error);
                }
            }
            
            const apiDirectors = Array.from(directorMap.entries()).map(([name, movies]) => ({
                name,
                movies,
                movieCount: movies.length,
                avgRating: (movies.reduce((sum, m) => sum + parseFloat(m.rating || 0), 0) / movies.length).toFixed(1)
            }));
            this.displayDirectors(apiDirectors);
        } catch (error) {
            console.error('Error loading directors:', error);
            this.displayDirectors([]);
        }
    }

    displayDirectors(directors) {
        const container = document.getElementById('directors-list');
        if (!container) return;

        // combine local directors with API directors (local first)
        const localAsDirectors = this.localDirectors.map(ld => ({
            name: ld.name,
            movies: ld.movies || [],
            movieCount: ld.movieCount || (ld.movies ? ld.movies.length : 0),
            avgRating: ld.avgRating || '-',
            _local: true,
            id: ld.id,
            bio: ld.bio || ''
        }));

        const combined = [...localAsDirectors, ...directors];

        if (combined.length === 0) {
            container.innerHTML = '<div class="empty-state">No directors found.</div>';
            return;
        }

        container.innerHTML = combined.map(director => `
            <div class="director">
                <div class="director-header">
                    <h3>${director.name}</h3>
                    <div class="director-stats">
                        <span class="movie-count">${director.movieCount} movies</span>
                        <span class="avg-rating">⭐ ${director.avgRating}</span>
                    </div>
                </div>
                ${director._local ? `<p style="padding:12px 16px;color:#ddd">${director.bio}</p>` : ''}
                <div class="director-movies">
                    ${director.movies && director.movies.length ? director.movies.map(movie => `
                        <div class="director-movie" onclick="cinemaApp.showMovieDetails('${movie.id}')">
                            <img src="${movie.poster}" alt="${movie.title}" onerror="this.onerror=null;this.src='https://via.placeholder.com/120x180?text=No+Image'">
                            <div class="movie-info">
                                <h4>${movie.title}</h4>
                                <p>${movie.year} • ⭐ ${movie.rating}</p>
                            </div>
                        </div>
                    `).join('') : (director._local ? '<div style="padding:12px;color:#ccc">No movies listed</div>' : '')}
                </div>
                ${director._local ? `<div style="padding:12px;display:flex;gap:8px;justify-content:flex-end;"><button class="edit-director" data-id="${director.id}">Edit</button><button class="delete-director" data-id="${director.id}">Delete</button></div>` : ''}
            </div>
        `).join('');

        // attach local director handlers
        container.querySelectorAll('.edit-director').forEach(btn => btn.addEventListener('click', () => this.editLocalDirector(btn.getAttribute('data-id'))));
        container.querySelectorAll('.delete-director').forEach(btn => btn.addEventListener('click', () => this.deleteLocalDirector(btn.getAttribute('data-id'))));
    }

    // KPI Chart
    initKPIChart() {
        const ctx = document.getElementById('kpiChart');
        if (!ctx) return;
        // Bar chart (Stored / API breakdown)
        this.kpiChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Local Movies', 'Favorites', 'API Suggestions'],
                datasets: [{
                    label: 'Movies count',
                    data: [0,0,0],
                    backgroundColor: ['rgba(54,162,235,0.6)','rgba(255,204,0,0.8)','rgba(75,192,192,0.6)'],
                    borderColor: ['rgba(54,162,235,1)','rgba(255,204,0,1)','rgba(75,192,192,1)'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } }
            }
        });

        // Doughnut chart for proportions
        const donutCtx = document.getElementById('kpiDonut');
        if (donutCtx) {
            this.kpiDonutInstance = new Chart(donutCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Local', 'Favorites', 'API'],
                    datasets: [{
                        data: [0,0,0],
                        backgroundColor: ['#36A2EB','#FFCC00','#4BC0C0'],
                        hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } }
                }
            });
        }

        // KPI Table
        const tbody = document.querySelector('#kpi table tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr><td>CineTech</td><td>156</td><td>24</td><td>4.8/5</td></tr>
                <tr><td>CinémaPlus</td><td>89</td><td>18</td><td>4.6/5</td></tr>
                <tr><td>MovieHub</td><td>234</td><td>31</td><td>4.7/5</td></tr>
                <tr><td>FilmStream</td><td>167</td><td>28</td><td>4.9/5</td></tr>
            `;
        }
    }

    // update dashboard using movies and favorites
    updateDashboard() {
        const totalLocal = this.localMovies.length;
        const totalFav = this.favorites.length;
        const totalApi = this.lastApiMovies ? this.lastApiMovies.length : 0;
        const totalEl = document.querySelector('#kpi-total-movies .kpi-value');
        if (totalEl) totalEl.textContent = String(totalLocal + totalFav + totalApi);

        const topSourceEl = document.querySelector('#kpi-top-source .kpi-value');
        if (topSourceEl) {
            const max = Math.max(totalLocal, totalFav, totalApi);
            let text = '—';
            if (max === totalLocal) text = `Local (${totalLocal})`;
            else if (max === totalFav) text = `Favorites (${totalFav})`;
            else if (max === totalApi) text = `API (${totalApi})`;
            topSourceEl.textContent = text;
        }

        if (this.kpiChartInstance) {
            this.kpiChartInstance.data.labels = ['Local Movies', 'Favorites', 'API Suggestions'];
            this.kpiChartInstance.data.datasets[0].data = [totalLocal, totalFav, totalApi];
            this.kpiChartInstance.update();
        }

        if (this.kpiDonutInstance) {
            this.kpiDonutInstance.data.datasets[0].data = [totalLocal, totalFav, totalApi];
            this.kpiDonutInstance.update();
        }
    }

    // Event listeners
    setupEventListeners() {
        // Refresh buttons
        document.getElementById('refreshMovies')?.addEventListener('click', () => {
            const btn = document.getElementById('refreshMovies');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            setTimeout(() => {
                this.loadRandomMovies();
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-sync-alt"></i> Get New Suggestions';
            }, 1000);
        });

        document.getElementById('refreshDirectors')?.addEventListener('click', () => {
            const btn = document.getElementById('refreshDirectors');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            setTimeout(() => {
                this.loadDirectors();
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Directors';
            }, 1000);
        });

        // Refresh local movies from API button
        document.getElementById('refreshLocalFromApi')?.addEventListener('click', async () => {
            const btn = document.getElementById('refreshLocalFromApi');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
            try {
                await this.refreshLocalMoviesFromAPI(10);
            } catch (e) {
                console.error('Error refreshing local movies from API', e);
            }
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-download"></i> Refresh Local From API';
        });

        // Modal close
        document.addEventListener('keydown', (e) => e.key === 'Escape' && this.closeModal());
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('movieModal');
            if (modal && e.target === modal) this.closeModal();
        });
    }

    // Cursor glow
    setupCursorGlow() {
        const cursor = document.querySelector('.cursor-glow');
        if (!cursor) return;

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        document.addEventListener('mousedown', () => cursor.style.transform = 'translate(-50%, -50%) scale(0.8)');
        document.addEventListener('mouseup', () => cursor.style.transform = 'translate(-50%, -50%) scale(1)');
    }

    // Load random movies
    async loadRandomMovies() {
        const movies = await this.getRandomMovies();
        this.displayMovies(movies, 'movies-container');
    }

    // Replace local movies by fetching from OMDb API and store them locally
    async refreshLocalMoviesFromAPI(targetCount = 10) {
        // remove existing local movies and any favorites pointing to them
        const oldLocalIds = new Set(this.localMovies.map(m => m.id));
        this.localMovies = [];
        this.saveLocalMovies();

        // remove favorites referencing removed local ids
        const beforeFavs = this.favorites.length;
        this.favorites = this.favorites.filter(f => !oldLocalIds.has(f.id));
        if (this.favorites.length !== beforeFavs) {
            localStorage.setItem('favorites', JSON.stringify(this.favorites));
            this.updateFavoritesCount();
            this.displayFavorites();
        }

        const searches = ['action','drama','comedy','thriller','sci-fi','romance','animation','crime','fantasy','adventure'];
        const collected = new Map();

        try {
            for (const term of searches) {
                if (collected.size >= targetCount) break;
                try {
                    const resp = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(term)}&apikey=${this.apiKey}`);
                    const data = await resp.json();
                    if (data && data.Search) {
                        for (const item of data.Search) {
                            if (collected.size >= targetCount) break;
                            if (!item.imdbID) continue;
                            if (collected.has(item.imdbID)) continue;
                            // fetch full details to get Poster and rating
                            try {
                                const dresp = await fetch(`https://www.omdbapi.com/?i=${item.imdbID}&apikey=${this.apiKey}`);
                                const details = await dresp.json();
                                if (details && details.Response !== 'False' && details.Poster && details.Poster !== 'N/A') {
                                    const fm = this.formatMovie(details);
                                    collected.set(fm.id, fm);
                                }
                            } catch (err) {
                                console.warn('detail fetch failed for', item.imdbID, err);
                            }
                        }
                    }
                } catch (err) {
                    console.warn('search fetch failed for', term, err);
                }
                // small pause to be polite
                await new Promise(r => setTimeout(r, 150));
            }

            // If not enough with posters, relax poster requirement
            if (collected.size < targetCount) {
                for (const term of searches) {
                    if (collected.size >= targetCount) break;
                    try {
                        const resp = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(term)}&apikey=${this.apiKey}`);
                        const data = await resp.json();
                        if (data && data.Search) {
                            for (const item of data.Search) {
                                if (collected.size >= targetCount) break;
                                if (!item.imdbID) continue;
                                if (collected.has(item.imdbID)) continue;
                                try {
                                    const dresp = await fetch(`https://www.omdbapi.com/?i=${item.imdbID}&apikey=${this.apiKey}`);
                                    const details = await dresp.json();
                                    if (details && details.Response !== 'False') {
                                        const fm = this.formatMovie(details);
                                        collected.set(fm.id, fm);
                                    }
                                } catch (err) {
                                    console.warn('detail fetch failed for', item.imdbID, err);
                                }
                            }
                        }
                    } catch (err) {
                        console.warn('search fetch failed for', term, err);
                    }
                    await new Promise(r => setTimeout(r, 120));
                }
            }

            // finalize list up to targetCount
            const finalList = Array.from(collected.values()).slice(0, targetCount);
            this.localMovies = finalList.map(m => ({
                id: m.id || ('local-' + Date.now() + Math.random().toString(36).substr(2,4)),
                title: m.title,
                director: m.director || 'Unknown',
                genre: m.genre || '',
                year: m.year || 'Unknown',
                rating: m.rating || null,
                poster: m.poster || 'https://via.placeholder.com/300x450?text=No+Poster',
                description: m.description || ''
            }));

            this.saveLocalMovies();
            this.renderLocalMovies();
            this.updateDashboard();
        } catch (err) {
            console.error('Error in refreshLocalMoviesFromAPI:', err);
            throw err;
        }
    }
}

// Initialize app
let cinemaApp;
document.addEventListener('DOMContentLoaded', () => {
    cinemaApp = new CinemaApp();
});
