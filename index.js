const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const app = express();
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const Professor = require('./models/Professor');
const Course = require('./models/course');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up Express middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
// Connect to MongoDB
async function connectToMongoDB() {
    try {
        await mongoose.connect('mongodb+srv://sl_admin:sl_admin_2024@scholarlogic.saza7v6.mongodb.net/scholarlogic', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
connectToMongoDB();

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/notifications', (req, res) => {
    res.render('notifications');
});



app.get('/register', (req, res) => {
    res.render('register');
});
// Handle registration form submission
app.post('/register', async (req, res) => {
    const { name, email, username, password, type } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10

        // Create a new user document
        const newUser = new User({
            name,
            email,
            username,
            password: hashedPassword, // Save the hashed password
            type
        });

        // Save the new user to the database
        await newUser.save();

        res.status(200).json({ success: true, message: 'Registration successful' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    console.log('POST request received at /login');
    console.log('Request body:', req.body); // Log the request body
    const { username, password } = req.body;
    try {

        const user = await User.findOne({ username }).lean(); 
        console.log('User Data:', user);
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                // Assuming user type is retrieved from the database and stored in userType variable
                res.status(200).json({ success: true, message: 'Login successful', type: user.type });
            } else {
                res.status(401).json({ success: false, message: 'Incorrect password' });
            }
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
            console.log('Request body:', req.body);
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/courses', (req, res) => {
    res.render('courses');
});

app.get('/assignments', (req, res) => {
    res.render('assignments');
});

app.get('/progress', (req, res) => {
    res.render('progress');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/quiz', (req, res) => {
    res.render('quiz');
});

app.get('/teacher/managequizzes.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'startQuiz', 'index.html'));
});

app.get('/javascript', (req, res) => {
    res.render('javascript');
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'admin.html'));
});


// Route to serve the HTML form and fetch professor data
app.get('/admin/manageprofessor', async (req, res) => {
    try {
        // Fetch professor data from the database
        const professors = await Professor.find({}).lean();

        // Send the professor data to the client as JSON
        res.json(professors);
    } catch (error) {
        console.error('Error fetching professor data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Assuming you're using Express
// Route to render the edit professor form
// Route to fetch professor data for editing

// Route to render the edit professor form


// Assuming your Professor model is defined somewhere in your code


app.get('/admin/editprofessor.html/:id', async (req, res, next) => {
    const professorId = req.params.id;

    // Check if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(professorId)) {
        // If not valid, it's likely a request for a static file
        // Return next() to let Express continue processing the request
        return next();
    }

    try {
        // Read the HTML file
        const htmlFilePath = path.join(__dirname, 'public', 'admin', 'editprofessor.html');
        fs.readFile(htmlFilePath, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading HTML file:', err);
                return res.status(500).json({ success: false, message: 'Internal server error' });
            }

            try {
                // Fetch professor data by ID
                const professor = await Professor.findById(professorId).lean();

                // Replace placeholders with professor data
                const updatedHtmlContent = data
                    .replace('{{professorName}}', professor.name || '')
                    .replace('{{professorEmail}}', professor.email || '')
                    .replace('{{professorQualification}}', professor.qualification || '')
                    .replace('{{assignedCourses}}', professor.assignedCourses || '');

                // Send the modified HTML content as the response
                res.send(updatedHtmlContent);
            } catch (error) {
                console.error('Error fetching professor data:', error);
                res.status(500).json({ success: false, message: 'Failed to fetch professor data' });
            }
        });
    } catch (error) {
        console.error('Error fetching professor:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch professor' });
    }
});



// Route to update professor data
app.post('/admin/editprofessor.html/:id', async (req, res) => {
    const professorId = req.params.id;
    const { professorName, professorEmail, professorQualification, assignedCourses } = req.body;

    try {
        console.log('Received professor data:', req.body); // Log the received data

        // Ensure assignedCourses is a string and not empty before splitting
        const coursesArray = (typeof assignedCourses === 'string' && assignedCourses.trim() !== '') ? assignedCourses.split(',').map(course => course.trim()) : [];

        // Find the professor by ID and update its details
        const updatedProfessor = await Professor.findByIdAndUpdate(professorId, {
            name: professorName, // Use the correct field name
            email: professorEmail, // Use the correct field name
            qualification: professorQualification, // Use the correct field name
            assignedCourses: coursesArray
        }, { new: true });

        if (!updatedProfessor) {
            return res.status(404).json({ success: false, message: 'Professor not found' });
        }

        //res.status(200).json({ success: true, message: 'Professor updated successfully', updatedProfessor });
        res.redirect('/admin/manageprofessor.html');
    } catch (error) {
        console.error('Error updating professor:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});




// Route to serve the HTML form
app.get('/admin/add-professor.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'addprofessor.html'));
});

// Route to handle form submission
// Route to handle form submission for adding a professor
app.post('/admin/addprofessor.html', async (req, res) => {
    const { name, email, qualification, assignedCourses } = req.body;

    try {
        // Create a new professor instance
        const professor = new Professor({
            name,
            email,
            qualification,
            assignedCourses: assignedCourses.split(',').map(course => course.trim())
        });

        // Save the professor to the database
        await professor.save();

        res.status(200).json({ success: true, message: 'Professor added successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});



// Assuming you're using Express
app.delete('/admin/deleteprofessor/:id', async (req, res) => {
    try {
        // Logic to delete the professor with the given ID
        await Professor.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Professor deleted successfully' });
    } catch (error) {
        console.error('Error deleting professor:', error);
        res.status(500).json({ success: false, message: 'Failed to delete professor' });
    }
});

app.get('/admin/manageprogram.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'manageprogram.html'));
});
app.get('/admin/managestudent', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'managestudent.html'));
});
app.get('/admin/notifications', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'notifications.html'));
});
app.get('/teacher/notifications', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teacher', 'notifications.html'));
});

app.get('/teacher/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teacher', 'teacher.html'));
});


// Route to fetch courses
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
app.get('/managecourses', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teachers', 'managecourses.html'));
});



app.post('/courses', async (req, res) => {
    try {
        const { courseCode, courseName, startDate, duration, price, details } = req.body;
        const course = new Course({ courseCode, courseName, startDate, duration, price, details });
        await course.save();
        res.status(201).json({ success: true, message: 'Course added successfully' });
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.delete('/api/courses/:id', async (req, res) => {
    const courseId = req.params.id;
    try {
        await Course.findByIdAndDelete(courseId);
        res.status(204).send(); 
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




app.get('/admin/managestudent.html', async (req, res) => {
    try {
        const students = await Student.find({}).lean();
        res.json(students);
    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/admin/editstudent/:id', async (req, res) => {
    try {
        const studentId = req.query.id;
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, student });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch student' });
    }
});

app.put('/admin/editstudent/:id', async (req, res) => {
    const studentId = req.params.id;
    const { name, email, grade, courses } = req.body;

    try {
        const coursesArray = (typeof courses === 'string' && courses.trim() !== '') ? courses.split(',').map(course => course.trim()) : [];

        const updatedStudent = await Student.findByIdAndUpdate(studentId, {
            name,
            email,
            grade,
            courses: coursesArray
        }, { new: true });

        if (!updatedStudent) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.status(200).json({ success: true, message: 'Student updated successfully', updatedStudent });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Route handler for adding a new student
app.post('/admin/addstudent.html', async (req, res) => {
    // Extract student data from the request body
    const { name, studentID, coursesEnrolled } = req.body;

    try {
        // Create a new instance of the Student model with the provided data
        const newStudent = new Student({
            name,
            studentID,
            coursesEnrolled
        });

        // Save the new student to the database
        await newStudent.save();

        // Send a success response
        res.status(201).json({ success: true, message: 'Student added successfully', student: newStudent });
    } catch (error) {
        // Handle errors
        console.error('Error adding student:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.delete('/admin/deletestudent/:id', async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ success: false, message: 'Failed to delete student' });
    }
});
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});