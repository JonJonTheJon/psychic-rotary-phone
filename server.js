const express = require('express');
const Database = require('better-sqlite3');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'posters');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    }
});

// Initialize SQLite database
const db = new Database(path.join(__dirname, 'movies.db'));

// Create tables
db.exec(`
    CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        year INTEGER,
        poster_url TEXT,
        poster_local TEXT,
        dop TEXT,
        bobo_crew TEXT,
        imdb_url TEXT,
        tmdb_url TEXT,
        trailer_url TEXT,
        production_company TEXT,
        synopsis TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// API Routes

// Get all movies
app.get('/api/movies', (req, res) => {
    try {
        const movies = db.prepare('SELECT * FROM movies ORDER BY year DESC, title ASC').all();
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single movie
app.get('/api/movies/:id', (req, res) => {
    try {
        const movie = db.prepare('SELECT * FROM movies WHERE id = ?').get(req.params.id);
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json(movie);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create movie
app.post('/api/movies', upload.single('poster'), (req, res) => {
    try {
        const { title, year, poster_url, dop, bobo_crew, imdb_url, tmdb_url, trailer_url, production_company, synopsis } = req.body;

        const poster_local = req.file ? `/uploads/posters/${req.file.filename}` : null;

        const stmt = db.prepare(`
            INSERT INTO movies (title, year, poster_url, poster_local, dop, bobo_crew, imdb_url, tmdb_url, trailer_url, production_company, synopsis)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(title, year || null, poster_url || null, poster_local, dop || null, bobo_crew || null, imdb_url || null, tmdb_url || null, trailer_url || null, production_company || null, synopsis || null);

        const newMovie = db.prepare('SELECT * FROM movies WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(newMovie);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update movie
app.put('/api/movies/:id', upload.single('poster'), (req, res) => {
    try {
        const { title, year, poster_url, dop, bobo_crew, imdb_url, tmdb_url, trailer_url, production_company, synopsis } = req.body;

        const existingMovie = db.prepare('SELECT * FROM movies WHERE id = ?').get(req.params.id);
        if (!existingMovie) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        let poster_local = existingMovie.poster_local;
        if (req.file) {
            // Delete old poster if exists
            if (existingMovie.poster_local) {
                const oldPath = path.join(__dirname, existingMovie.poster_local);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            poster_local = `/uploads/posters/${req.file.filename}`;
        }

        const stmt = db.prepare(`
            UPDATE movies
            SET title = ?, year = ?, poster_url = ?, poster_local = ?, dop = ?, bobo_crew = ?,
                imdb_url = ?, tmdb_url = ?, trailer_url = ?, production_company = ?, synopsis = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        stmt.run(title, year || null, poster_url || null, poster_local, dop || null, bobo_crew || null, imdb_url || null, tmdb_url || null, trailer_url || null, production_company || null, synopsis || null, req.params.id);

        const updatedMovie = db.prepare('SELECT * FROM movies WHERE id = ?').get(req.params.id);
        res.json(updatedMovie);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete movie
app.delete('/api/movies/:id', (req, res) => {
    try {
        const movie = db.prepare('SELECT * FROM movies WHERE id = ?').get(req.params.id);
        if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        // Delete poster file if exists
        if (movie.poster_local) {
            const posterPath = path.join(__dirname, movie.poster_local);
            if (fs.existsSync(posterPath)) {
                fs.unlinkSync(posterPath);
            }
        }

        db.prepare('DELETE FROM movies WHERE id = ?').run(req.params.id);
        res.json({ message: 'Movie deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Seed initial data if database is empty
const movieCount = db.prepare('SELECT COUNT(*) as count FROM movies').get();
if (movieCount.count === 0) {
    const seedMovies = [
        {
            title: 'Tuntematon Sotilas',
            year: 2017,
            poster_url: 'https://image.tmdb.org/t/p/w500/vOipe2myi26UNfY1ufV8Ywlwqbe.jpg',
            dop: 'Mika Orasmaa',
            bobo_crew: 'Matti Kuusniemi (DIT)',
            trailer_url: 'https://www.youtube.com/watch?v=4dAaLbsQSzI',
            production_company: 'Elokuvaosakeyhtiö Suomi 2017'
        },
        {
            title: 'Hevi Reissu',
            year: 2018,
            poster_url: 'https://image.tmdb.org/t/p/w500/xJnbMTrJ2fl1AXAKx34qu8yMDnv.jpg',
            dop: 'Tuomo Hutri',
            bobo_crew: 'Matti Kuusniemi (DIT)',
            trailer_url: 'https://www.youtube.com/watch?v=VZjGnwMPGXg',
            production_company: 'Making Movies'
        },
        {
            title: 'Laugh or Die',
            year: 2018,
            poster_url: 'https://image.tmdb.org/t/p/w500/7KdmKMcMwrMXvPXoK0N7mM9sNNw.jpg',
            dop: 'Rauno Ronkainen',
            bobo_crew: 'Matti Kuusniemi (DIT)',
            trailer_url: 'https://www.youtube.com/watch?v=4b7gF04CpHQ',
            production_company: 'Helsinki-filmi'
        },
        {
            title: 'Oma maa',
            year: 2018,
            poster_url: 'https://image.tmdb.org/t/p/w500/7RaFtzxtaiO21vyVkGfxlbPVPV0.jpg',
            dop: 'Rauno Ronkainen',
            bobo_crew: 'Matti Kuusniemi (DIT)',
            trailer_url: 'https://www.youtube.com/watch?v=G_2T6l_Rnx0',
            production_company: 'Elokuvaosakeyhtiö Aamu'
        },
        {
            title: 'Veljeni Vartija',
            year: 2018,
            poster_url: 'https://image.tmdb.org/t/p/w500/bQS43HSLZzMjZkcHJz4fGc7fNdz.jpg',
            dop: 'Tuomo Hutri',
            bobo_crew: 'Matti Kuusniemi (DIT)',
            trailer_url: 'https://www.youtube.com/watch?v=cMTAUr3Nm6I',
            production_company: 'Solar Films'
        },
        {
            title: 'Tuntematon mestari',
            year: 2018,
            poster_url: 'https://image.tmdb.org/t/p/w500/8PWFBT8K8YnFtyqaAM3GbdzYoMV.jpg',
            dop: 'Peter Flinckenberg',
            bobo_crew: 'Matti Kuusniemi (DIT)',
            trailer_url: 'https://www.youtube.com/watch?v=_jBLyJQHR3Q',
            production_company: 'Inland Film Company'
        },
        {
            title: 'Ihmisen osa',
            year: 2018,
            poster_url: 'https://image.tmdb.org/t/p/w500/iLmYX6gK3rXhNl8TWYjrCxsUKlx.jpg',
            dop: 'Pietari Peltola',
            bobo_crew: 'Matti Kuusniemi (DIT)',
            trailer_url: 'https://www.youtube.com/watch?v=eFynkQl9Gek',
            production_company: 'Bufo'
        },
        {
            title: 'Joulumaa',
            year: 2017,
            poster_url: 'https://image.tmdb.org/t/p/w500/ueAXbqFzSmqqJ1l4PxRkiKxLNVH.jpg',
            dop: 'Hannu-Pekka Vitikainen',
            bobo_crew: 'Matti Kuusniemi (DIT)',
            trailer_url: 'https://www.youtube.com/watch?v=E3A3Q1PC7Ok',
            production_company: 'Solar Films'
        }
    ];

    const insertStmt = db.prepare(`
        INSERT INTO movies (title, year, poster_url, dop, bobo_crew, trailer_url, production_company)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const movie of seedMovies) {
        insertStmt.run(movie.title, movie.year, movie.poster_url, movie.dop, movie.bobo_crew, movie.trailer_url, movie.production_company);
    }
    console.log('Database seeded with initial movies');
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin panel at http://localhost:${PORT}/admin.html`);
});
