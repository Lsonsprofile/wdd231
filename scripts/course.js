const courses = [
    {
        subject: 'CSE',
        number: 110,
        title: 'Introduction to Programming',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course will introduce students to programming. It will introduce the building blocks of programming languages (variables, decisions, calculations, loops, array, and input/output) and use them to solve problems.',
        technology: [
            'Python'
        ],
        completed: true
    },
    {
        subject: 'WDD',
        number: 130,
        title: 'Web Fundamentals',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course introduces students to the World Wide Web and to careers in web site design and development. The course is hands on with students actually participating in simple web designs and programming. It is anticipated that students who complete this course will understand the fields of web design and development and will have a good idea if they want to pursue this degree as a major.',
        technology: [
            'HTML',
            'CSS'
        ],
        completed: true
    },
    {
        subject: 'CSE',
        number: 111,
        title: 'Programming with Functions',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'CSE 111 students become more organized, efficient, and powerful computer programmers by learning to research and call functions written by others; to write, call , debug, and test their own functions; and to handle errors within functions. CSE 111 students write programs with functions to solve problems in many disciplines, including business, physical science, human performance, and humanities.',
        technology: [
            'Python'
        ],
        completed: true
    },
    {
        subject: 'CSE',
        number: 210,
        title: 'Programming with Classes',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course will introduce the notion of classes and objects. It will present encapsulation at a conceptual level. It will also work with inheritance and polymorphism.',
        technology: [
            'C#'
        ],
        completed: true
    },
    {
        subject: 'WDD',
        number: 131,
        title: 'Dynamic Web Fundamentals',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course builds on prior experience in Web Fundamentals and programming. Students will learn to create dynamic websites that use JavaScript to respond to events, update content, and create responsive user experiences.',
        technology: [
            'HTML',
            'CSS',
            'JavaScript'
        ],
        completed: true
    },
    {
        subject: 'WDD',
        number: 231,
        title: 'Frontend Web Development I',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course builds on prior experience with Dynamic Web Fundamentals and programming. Students will focus on user experience, accessibility, compliance, performance optimization, and basic API usage.',
        technology: [
            'HTML',
            'CSS',
            'JavaScript'
        ],
        completed: false
    }
];

const courseList = document.querySelector("#course-list");

function createCourseCard(course) {
  const card = document.createElement("div");
  card.classList.add("course-card");

  // Decide status text and class with if/else
  let statusText;
  let statusClass;

  if (course.completed) {
    statusText = "Completed";
    statusClass = "completed";
  } else {
    statusText = "Incomplete";
    statusClass = "incomplete";
  }

  card.innerHTML = `
    <div class="course-header">
        <h4>${course.subject} ${course.number}</h4>
        <p class="credits">Credits: ${course.credits}</p>
    </div>
      <div class="course-body">
        <h5>${course.title}</h5>
        <p class="course-description">${course.description}</p>
        <p class="technology">${course.technology.join(", ")}</p>
        <p class="status ${statusClass}">${statusText}</p>
    </div>
  `;

  return card;
}


function displayCourses(filteredCourses) {
  courseList.innerHTML = ""; 

  filteredCourses.forEach(course => {
    const card = createCourseCard(course); 
    courseList.appendChild(card); 
  });

  
  const total = filteredCourses.reduce((sum, course) => sum + course.credits, 0);
  document.getElementById("course-count").textContent = total;
}

const buttons = document.querySelectorAll(".certificate .btn");
function setActiveButton(clickedButton) { 
    buttons.forEach(function(btn){ btn.classList.remove("active")}); 
    clickedButton.classList.add("active"); }

document.getElementById("course-btn").addEventListener("click", function () {
  displayCourses(courses);
});


document.getElementById("btn-wdd").addEventListener("click", function () {
  const wddCourses = courses.filter(function (course) {
    return course.subject === "WDD";
  });
  displayCourses(wddCourses);
});


document.getElementById("btn-cse").addEventListener("click", function () {
  const cseCourses = courses.filter(function (course) {
    return course.subject === "CSE";
  });
  displayCourses(cseCourses);
});


// Call with your data
displayCourses(courses);
