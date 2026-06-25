
DROP TABLE attendance;
DROP TABLE student_medical_history;
DROP TABLE user_phone_numbers;
DROP TABLE user_notifications;
DROP TABLE students_parents;
DROP TABLE grades_per_term;
DROP TABLE medical_record;
DROP TABLE course_have_assignments;
DROP TABLE delays;
DROP TABLE permissions;
DROP TABLE violations;
DROP TABLE sessions;
DROP TABLE reports;
DROP TABLE student_in_a_team;

DROP TABLE Team;
DROP TABLE Project;
DROP TABLE Marks;
DROP TABLE assignment;
DROP TABLE Course;
DROP TABLE Term;
DROP TABLE Training_Program;
DROP TABLE Student_evaluation;
DROP TABLE Student_feedback;
DROP TABLE Engineer_feedback;
DROP TABLE notification;
DROP TABLE Parent_have_Student;
DROP TABLE Parent;
DROP TABLE Teacher;
DROP TABLE Student;
DROP TABLE Grade;
DROP TABLE class;
DROP TABLE Marks_type;


DROP TABLE Users CASCADE CONSTRAINTS;
DROP TABLE Roles;


CREATE TABLE Roles
(
    Role_ID      NUMBER PRIMARY KEY,
    role_name    VARCHAR2 (100) NOT NULL UNIQUE
);

CREATE TABLE Users
(
    User_id                 NUMBER PRIMARY KEY,
    First_name              VARCHAR2 (150) NOT NULL,
    Last_name               VARCHAR2 (150) NOT NULL,
    Email                   VARCHAR2 (150) NOT NULL UNIQUE,
    Address                 VARCHAR2 (150),
    First_name_in_arabic    VARCHAR2 (150),
    Last_name_in_arabic     VARCHAR2 (150),
    Password                VARCHAR2 (150) NOT NULL,
    isDeleted               NUMBER (1) CHECK (isDeleted IN (0, 1)),
    Created_at              DATE,
    last_login              DATE,
    Gender                  CHAR (1) CHECK (Gender IN ('M', 'F')),
    Nationality             VARCHAR2 (100),
    Birth_date              DATE,
    Religion                VARCHAR2 (90),
    national_number         NUMBER UNIQUE,
    Role_ID                 NUMBER NOT NULL,
    CONSTRAINT fk_users_role FOREIGN KEY (Role_ID) REFERENCES Roles (Role_ID)
);

CREATE TABLE Student
(
    Student_id                         NUMBER PRIMARY KEY,
    User_id                            NUMBER NOT NULL UNIQUE,
    Governorate                        VARCHAR2 (40),
    Academic_score_in_middle_school    NUMBER,
    Place_of_birth                     VARCHAR2 (90),
    CONSTRAINT fk_student_user FOREIGN KEY (User_ID)
        REFERENCES Users (User_ID)
);

CREATE TABLE Teacher
(
    Teacher_id                       NUMBER PRIMARY KEY,
    User_id                          NUMBER NOT NULL UNIQUE,
    Education                        VARCHAR2 (255),
    Employment_history               VARCHAR2 (255),
    Number_of_years_of_experience    NUMBER,
    CONSTRAINT fk_teacher_user FOREIGN KEY (User_id)
        REFERENCES Users (User_id)
);

CREATE TABLE Parent
(
    Parent_id    NUMBER PRIMARY KEY,
    User_id      NUMBER NOT NULL UNIQUE,
    job_name     VARCHAR2 (60),
    CONSTRAINT fk_parent_user FOREIGN KEY (User_id)
        REFERENCES Users (User_id)
);

CREATE TABLE Parent_have_Student
(
    Parent_ID      NUMBER NOT NULL,
    Student_ID     NUMBER NOT NULL,
    parent_role    VARCHAR2 (50),
    Is_Guardian    NUMBER (1) DEFAULT 0 CHECK (Is_Guardian IN (0, 1)),
    CONSTRAINT fk_parent_parent FOREIGN KEY (Parent_ID)
        REFERENCES Parent (Parent_id),
    CONSTRAINT fk_student_student FOREIGN KEY (Student_ID)
        REFERENCES Student (Student_id)
);

CREATE TABLE Grade
(
    grade_id    NUMBER PRIMARY KEY,
    name        VARCHAR2 (100) NOT NULL UNIQUE
);

CREATE TABLE Engineer_feedback
(
    feedback_id      NUMBER PRIMARY KEY,
    User_id          NUMBER NOT NULL,
    Teacher_id       NUMBER NOT NULL,
    Feedback_date    DATE NOT NULL,
    Feedback         VARCHAR2 (255) NOT NULL,
    Notes            VARCHAR2 (255),
    CONSTRAINT fk_feedback_user FOREIGN KEY (User_id)
        REFERENCES Users (User_id),
    CONSTRAINT fk_feedback_teacher FOREIGN KEY (Teacher_id)
        REFERENCES Teacher (Teacher_id)
);

CREATE TABLE Student_feedback
(
    feedback_id          NUMBER PRIMARY KEY,
    Student_id           NUMBER NOT NULL,
    User_id              NUMBER NOT NULL,
    Feedback_date        DATE NOT NULL,
    Performance_notes    VARCHAR2 (255) NOT NULL,
    Behavior_notes       VARCHAR2 (255),
    Recommendations      VARCHAR2 (255),
    CONSTRAINT fk_feedback_student FOREIGN KEY (Student_id)
        REFERENCES Student (Student_id),
    CONSTRAINT fk_feedback_users FOREIGN KEY (User_id)
        REFERENCES Users (User_id)
);

CREATE TABLE Student_evaluation
(
    Evaluation_id      NUMBER PRIMARY KEY,
    Student_id         NUMBER NOT NULL,
    User_id            NUMBER NOT NULL,
    Evaluation_date    DATE NOT NULL,
    Score              NUMBER,
    Evaluation_text    VARCHAR2 (150) NOT NULL,
    Evaluation_note    VARCHAR2 (150),
    CONSTRAINT fk_evaluation_student FOREIGN KEY (Student_id)
        REFERENCES Student (Student_id),
    CONSTRAINT fk_evaluation_user FOREIGN KEY (User_id)
        REFERENCES Users (User_id)
);

CREATE TABLE Training_Program
(
    Program_id      NUMBER PRIMARY KEY,
    User_id         NUMBER NOT NULL,
    Teacher_id      NUMBER NOT NULL,
    Program_name    VARCHAR2 (255) NOT NULL,
    Description     VARCHAR2 (255),
    Start_date      DATE NOT NULL,
    End_date        DATE,
    Location        VARCHAR2 (255),
    Created_at      TIMESTAMP NOT NULL,
    CONSTRAINT fk_program_user FOREIGN KEY (User_id)
        REFERENCES Users (User_id),
    CONSTRAINT fk_program_teacher FOREIGN KEY (Teacher_id)
        REFERENCES Teacher (Teacher_id)
);

CREATE TABLE Term
(
    term_id    NUMBER PRIMARY KEY,
    term       NUMBER NOT NULL,
    year       NUMBER NOT NULL
);

CREATE TABLE Course
(
    Course_id      NUMBER PRIMARY KEY,
    Teacher_id     NUMBER NOT NULL,
    Term_id        NUMBER NOT NULL,
    Course_type    VARCHAR2 (80) NOT NULL,
    Course_name    VARCHAR2 (100) NOT NULL,
    Description    VARCHAR2 (100),
    Study_plan     VARCHAR2 (100),
    CONSTRAINT fk_course_teacher FOREIGN KEY (Teacher_id)
        REFERENCES Teacher (Teacher_id),
    CONSTRAINT fk_course_term FOREIGN KEY (Term_id) REFERENCES Term (term_id)
);

CREATE TABLE Marks_type
(
    Type_id    NUMBER PRIMARY KEY,
    TYPE       VARCHAR2 (50) NOT NULL UNIQUE
);

CREATE TABLE Marks
(
    Mark_id          NUMBER PRIMARY KEY,
    User_id          NUMBER NOT NULL,
    Type_id          NUMBER NOT NULL,
    Course_id        NUMBER NOT NULL,
    Feedback_date    DATE NOT NULL,
    Feedback         VARCHAR2 (255),
    Notes            VARCHAR2 (255),
    CONSTRAINT fk_marks_user FOREIGN KEY (User_id) REFERENCES Users (User_id),
    CONSTRAINT fk_marks_type FOREIGN KEY (Type_id)
        REFERENCES Marks_type (Type_id),
    CONSTRAINT fk_marks_course FOREIGN KEY (Course_id)
        REFERENCES Course (Course_id)
);

CREATE TABLE Project
(
    Project_id     NUMBER PRIMARY KEY,
    Course_id      NUMBER NOT NULL,
    Assign_date    DATE NOT NULL,
    Name           VARCHAR2 (100) NOT NULL,
    Description    VARCHAR2 (255),
    Deadline       DATE NOT NULL,
    CONSTRAINT fk_project_course FOREIGN KEY (Course_id)
        REFERENCES Course (Course_id)
);

CREATE TABLE Team
(
    Team_id       NUMBER PRIMARY KEY,
    Project_id    NUMBER NOT NULL,
    Name          VARCHAR2 (255) NOT NULL,
    CONSTRAINT fk_team_project FOREIGN KEY (Project_id)
        REFERENCES Project (Project_id)
);






create table assignment(
    assignment_id number primary key ,
    name varchar2(255) not null,
    deadline DATE not null,
    assign_date DATE not null,
    description varchar2(255) not null,
    file_link varchar2(255),
    student_submission varchar2(255) not null
);

create table student_in_a_team(
    student_id number references STUDENT(Student_id),
    team_id number references TEAM(team_id),
    constraint pk_student_team primary key (student_id, team_id)
);

create table class (
    class_id number primary key ,
    grade_id number references Grade(grade_id) not null,
    name varchar2(255) not null ,
    capacity number not null check ( capacity > 0 )
);

create table reports (
    report_id number primary key ,
    user_id number references USERS(USER_ID) not null,
    content varchar2(255) not null,
    file_link varchar2(255),
    created_at date default sysdate,
    sent_to number references USERS(USER_ID) not null
);

create table sessions (
    session_id number primary key ,
    class_id number references class(class_id) not null,
    course_id number references COURSE(Course_id) not null,
    day_of_week number check ( day_of_week < 6  ) check ( day_of_week > 0 ) not null,
    start_at date not null ,
    end_at date not null ,
    updated_at date not null
);

create table violations (
    violation_id number primary key ,
    student_id number references STUDENT(Student_id) not null,
    violation varchar2(255) not null,
    name_of_violator varchar2(255) not null,
    applicable_procedure varchar2(255) not null,
    referring_authority varchar2(255) not null ,
    isMeeting number not null check ( isMeeting in (1, 0)) ,
    notes varchar2(255) ,
    "date" date default sysdate
);

create table permissions (
    permission_id number primary key ,
    student_id number references Student(Student_id) not null ,
    reason varchar2(255) not null ,
    notes varchar2(255) ,
    "date" date default sysdate
);

create table delays (
    delay_id number primary key ,
    student_id number references STUDENT(Student_id) not null,
    time_of_arrival DATE not null,
    notes varchar2(255) ,
    "date" DATE default sysdate
);

create table course_have_assignments(
    assignment_id number references assignment(assignment_id),
    course_id number references COURSE(Course_id),
    constraint pk_assign_course primary key (assignment_id, course_id)
);

create table medical_record (
    medical_id number primary key ,
    student_id number references STUDENT(Student_id) not null ,
    illness_type varchar2(255) not null
);

create table notification (
    notification_id number primary key ,
    title varchar2(255) not null,
    type varchar2(255) not null,
    priority varchar2(255) not null,
    sent_at date default sysdate,
    body varchar2(255) not null
);

create table grades_per_term (
    grade_id number references Grade(grade_id) not null,
    term_id number references Term(term_id) not null
);

create table students_parents (
    parent_id number references Parent(Parent_id) not null,
    student_id number references STUDENT(Student_id) not null,
    parent_role varchar2(255) not null,
    isGuardian number check ( isGuardian in (1 , 0)) not null
);

create table user_notifications (
    user_id number references USERS(USER_ID) not null,
    notification_id number references notification(notification_id) not null,
    sent_to number references USERS(USER_ID) not null
);

create table user_phone_numbers (
    user_id number references USERS(USER_ID),
    phone_number number,
    constraint pk_user_phone primary key (user_id, phone_number)
);

create table student_medical_history (
    student_id number references STUDENT(Student_id),
    medical_note varchar2(255),
    constraint pk_student_medical primary key (student_id, medical_note)
);

create table attendance (
    attendance_id number primary key ,
    student_id number references STUDENT(Student_id) not null,
    session_id number references sessions(session_id),
    status char(1) check ( status in ('a', 'p') )
);