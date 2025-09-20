// Courses and semesters based on subjects.ts data
export const courses = ['B.Tech', 'BCA'];

export const semestersByCourse = {
  'B.Tech': Array.from({ length: 8 }, (_, i) => i + 1), // Semesters 1 to 8
  'BCA': Array.from({ length: 6 }, (_, i) => i + 1), // Semesters 1 to 6
};

export const btechSubjectsBySemester = {
  1: [
    'Engineering Mathematics – I',
    'Engineering Physics / Chemistry',
    'Programming in C',
    'Basic Electrical / Electronics Engineering',
    'Engineering Graphics / Workshop Practice',
    'Communication Skills',
    'Environmental Studies',
  ],
  2: [
    'Engineering Mathematics – II',
    'Data Structures using C',
    'Digital Logic',
    'Discrete Mathematics',
    'Object-Oriented Programming',
    'Engineering Physics / Chemistry (opposite of Sem 1)',
    'Lab Work',
  ],
  3: [
    'Computer Organization and Architecture',
    'Data Structures & Algorithms',
    'Operating Systems',
    'Database Management Systems',
    'Software Engineering',
    'Lab Work',
  ],
  4: [
    'Theory of Computation',
    'Microprocessors and Interfacing',
    'Design and Analysis of Algorithms',
    'Web Technologies',
    'Computer Networks',
    'Lab Work',
  ],
  5: [
    'Compiler Design',
    'Artificial Intelligence',
    'Mobile Computing',
    'Elective I',
    'Computer Graphics',
    'Lab Work',
  ],
  6: [
    'Machine Learning',
    'Software Project Management',
    'Information Security',
    'Elective II',
    'Lab Work',
  ],
  7: [
    'Major Project – Phase I',
    'Internship',
    'Elective III',
    'Seminar',
  ],
  8: [
    'Major Project – Phase II',
    'Comprehensive Viva',
    'Final Elective(s)',
  ],
};

export const bcaSubjectsBySemester = {
  1: [
    'Fundamentals of Computers',
    'Programming in C',
    'Mathematics I',
    'Digital Electronics',
    'Communication Skills',
    'Lab Work',
  ],
  2: [
    'Data Structures',
    'OOP using C++',
    'Mathematics II',
    'Operating Systems',
    'DBMS',
    'Lab Work',
  ],
  3: [
    'Computer Networks',
    'Web Development',
    'Software Engineering',
    'Java Programming',
    'Lab Work',
  ],
  4: [
    'Python Programming',
    'Advanced DBMS',
    'Design and Analysis of Algorithms',
    'Operating System Concepts',
    'Lab Work',
  ],
  5: [
    'Mobile App Development',
    '.NET Programming or PHP',
    'Artificial Intelligence',
    'Mini Project',
    'Lab Work',
  ],
  6: [
    'Cloud Computing',
    'Major Project / Internship',
    'Computer Graphics',
    'Seminar',
  ],
};
