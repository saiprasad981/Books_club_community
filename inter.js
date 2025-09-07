// Firebase configuration
// ...existing code...
const firebaseConfig = {
  apiKey: "AIzaSyD4ExkZQJLgIbMEx4HTXsEp7dAR5Ue-TPM",
  authDomain: "hackathon-b062a.firebaseapp.com",
  projectId: "hackathon-b062a",
  storageBucket: "hackathon-b062a.appspot.com",
  messagingSenderId: "813298313319",
  appId: "1:813298313319:web:6d2cc85a3fe7b35c668cc2",
  measurementId: "G-GH9EN3J3D4",
};
// ...existing code...

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const sampleBooks = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Fiction",
    image: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
    description:
      "A classic novel of the Jazz Age, exploring themes of decadence, idealism, and excess.",
    rating: 4.3,
    reviews: [],
  },
  {
    id: 2,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    genre: "Non-Fiction",
    image: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
    description:
      "A brief history of humankind, exploring how Homo sapiens came to dominate the planet.",
    rating: 4.7,
    reviews: [],
  },
];

// ...existing code...

const sampleGroups = [
  {
    id: 1,
    name: "Classic Literature Club",
    description: "Discuss and enjoy classic literature with fellow readers.",
    members: 14,
    joined: false,
    discussions: [
      { user: "Anna", message: "Just finished 'Pride and Prejudice'. Anyone else?" },
      { user: "You", message: "Loved the character development in that book!" },
    ],
  },
  {
    id: 2,
    name: "Science Fiction & Fantasy",
    description: "For fans of sci-fi and fantasy novels.",
    members: 20,
    joined: false,
    discussions: [
      { user: "John", message: "Just started reading Dune. Any thoughts?" },
      { user: "Stuart", message: "One of the best sci-fi novels ever!" },
    ],
  },
  {
    id: 3,
    name: "Non-Fiction Readers",
    description: "Exploring the world of non-fiction together.",
    members: 8,
    joined: false,
    discussions: [{ user: "Mike", message: "Any good biography recommendations?" }],
  },
];

// State
let currentGenre = "all";
let currentBook = null;
let currentGroup = null;
let isLoggedIn = false;
let currentUser = null;
let books = [];
let groups = [];
let isSignUpMode = false;

// Elements
const genreList = document.getElementById("genre-list");
const bookList = document.getElementById("book-list");
const bookModal = document.getElementById("book-modal");
const modalClose = bookModal.querySelector(".close-btn");
const modalImage = document.getElementById("modal-image");
const modalTitle = document.getElementById("modal-title");
const modalAuthor = document.getElementById("modal-author");
const modalGenre = document.getElementById("modal-genre");
const modalRating = document.getElementById("modal-rating");
const modalDesc = document.getElementById("modal-desc");
const reviewList = document.getElementById("review-list");
const reviewForm = document.getElementById("review-form");
const reviewUser = document.getElementById("review-user");
const reviewRating = document.getElementById("review-rating");
const reviewText = document.getElementById("review-text");
const groupsSection = document.getElementById("groups-section");
const groupList = document.getElementById("group-list");
const groupForm = document.getElementById("group-form");
const newGroupName = document.getElementById("new-group-name");
const booksSection = document.getElementById("books-section");
const btnBooks = document.getElementById("btn-books");
const btnClubs = document.getElementById("btn-clubs");
// Discussion Modal Elements
const discussionModal = document.getElementById("discussion-modal");
const discussionTitle = document.getElementById("discussion-title");
const discussionClose = document.getElementById("discussion-close");
const discussionMessages = document.getElementById("discussion-messages");
const discussionForm = document.getElementById("discussion-form");
const discussionInput = document.getElementById("discussion-input");
// Login Modal Elements
const loginModal = document.getElementById("login-modal");
const loginBtn = document.getElementById("login-btn");
const loginCloseBtn = loginModal.querySelector(".close-btn");
const loginForm = document.getElementById("login-form");
const forgotPasswordLink = loginModal.querySelector(".forgot-password");
const toggleAuthModeLink = document.getElementById("toggle-auth-mode");
const usernameInput = document.getElementById("username-input");
// Dark Mode Elements
const modeToggle = document.getElementById("mode-toggle");
const body = document.body;

// Initialize data from Firebase
async function initData() {
  try {
    // Load books
    const booksSnapshot = await db.collection("books").get();
    if (booksSnapshot.empty) {
      // If no books in database, add sample books
      for (const book of sampleBooks) {
        await db.collection("books").doc(book.id.toString()).set(book);
      }
      books = [...sampleBooks];
    } else {
      books = booksSnapshot.docs.map((doc) => doc.data());
    }

    // Load groups
    const groupsSnapshot = await db.collection("groups").get();
    if (groupsSnapshot.empty) {
      // If no groups in database, add sample groups
      for (const group of sampleGroups) {
        await db.collection("groups").doc(group.id.toString()).set(group);
      }
      groups = [...sampleGroups];
    } else {
      groups = groupsSnapshot.docs.map((doc) => doc.data());
    }

    // Render the data
    renderBooks();
    renderGroups();
  } catch (error) {
    console.error("Error initializing data:", error);
  }
}

// Render books filtered by currentGenre
function renderBooks() {
  bookList.innerHTML = "";
  const filteredBooks =
    currentGenre === "all" ? books : books.filter((b) => b.genre === currentGenre);

  if (filteredBooks.length === 0) {
    bookList.innerHTML =
      "<p style='grid-column: 1/-1; text-align:center;'>No books found in this genre.</p>";
    return;
  }

  filteredBooks.forEach((book) => {
    const card = document.createElement("div");
    card.className = "book-card";
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute(
      "aria-label",
      `Book: ${book.title} by ${book.author}, rating ${book.rating}`
    );
    card.dataset.id = book.id;

    const img = document.createElement("img");
img.src = book.image;
img.alt = `Cover image of ${book.title}`;
img.loading = "lazy";

    const info = document.createElement("div");
    info.className = "book-info";

    const title = document.createElement("h3");
    title.className = "book-title";
    title.textContent = book.title;

    const author = document.createElement("p");
    author.className = "book-author";
    author.textContent = book.author;

    const rating = document.createElement("div");
    rating.className = "stars";
    let stars = "★".repeat(Math.floor(book.rating));
    if (book.rating % 1 >= 0.5) stars += "½";
    rating.textContent = stars;
    rating.setAttribute("aria-label", `Rating: ${book.rating} stars`);

    info.append(title, author, rating);
    card.append(img, info);
    bookList.appendChild(card);

    // Click and keyboard open modal
    card.addEventListener("click", () => openBookModal(book.id));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openBookModal(book.id);
      }
    });
  });
}

// Open book modal with book details
async function openBookModal(bookId) {
  try {
    const doc = await db.collection("books").doc(bookId.toString()).get();
    if (!doc.exists) {
      console.error("Book not found");
      return;
    }

    currentBook = doc.data();
    // fallback if no image field in Firestore
modalImage.src = currentBook.image || "images/placeholder.png";

    modalImage.alt = `Cover of ${currentBook.title}`;
    modalTitle.textContent = currentBook.title;
    modalAuthor.textContent = `Author: ${currentBook.author}`;
    modalGenre.textContent = `Genre: ${currentBook.genre}`;
    modalRating.textContent = `Rating: ${currentBook.rating.toFixed(1)}`;
    modalDesc.textContent = currentBook.description;
    renderReviews();
    bookModal.classList.add("active");
    document.body.style.overflow = "hidden";
  } catch (error) {
    console.error("Error opening book modal:", error);
  }
}

// Close book modal
function closeBookModal() {
  bookModal.classList.remove("active");
  document.body.style.overflow = "";
  currentBook = null;
}

// Render reviews for currentBook
function renderReviews() {
  reviewList.innerHTML = "";
  if (!currentBook) return;

  if (currentBook.reviews.length === 0) {
    reviewList.innerHTML = "<p>No reviews yet. Be the first to review!</p>";
    return;
  }

  currentBook.reviews.forEach((review) => {
    const div = document.createElement("div");
    div.className = "review-item";
    div.innerHTML = `<strong>${review.user}</strong> (${"★".repeat(
      review.rating
    )}): ${review.text}`;
    reviewList.appendChild(div);
  });
}

// Add new review form submission
reviewForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentBook) return;

  if (!isLoggedIn) {
    alert("Please log in to add a review.");
    openLoginModal();
    return;
  }

  const user = reviewUser.value.trim();
  const rating = parseInt(reviewRating.value, 10);
  const text = reviewText.value.trim();

  if (user && rating && text) {
    try {
      // Add review to the book in Firestore
      const updatedReviews = [...currentBook.reviews, { user, rating, text }];
      await db
        .collection("books")
        .doc(currentBook.id.toString())
        .update({
          reviews: updatedReviews,
        });

      // Update local state
      currentBook.reviews = updatedReviews;
      const bookIndex = books.findIndex((b) => b.id === currentBook.id);
      if (bookIndex !== -1) {
        books[bookIndex].reviews = updatedReviews;
      }

      renderReviews();
      reviewForm.reset();
    } catch (error) {
      console.error("Error adding review:", error);
      alert("Failed to add review. Please try again.");
    }
  }
});

// Render groups (book clubs)
function renderGroups() {
  groupList.innerHTML = "";
  groups.forEach((group) => {
    const div = document.createElement("div");
    div.className = "group-card";
    div.setAttribute("tabindex", "0");
    div.setAttribute("role", "article");
    div.setAttribute(
      "aria-label",
      `Book club: ${group.name}, ${group.members} members`
    );

    const title = document.createElement("h3");
    title.textContent = group.name;

    const desc = document.createElement("p");
    desc.textContent = group.description;

    const members = document.createElement("p");
    members.textContent = `Members: ${group.members}`;

    const buttons = document.createElement("div");

    const btnJoin = document.createElement("button");
    btnJoin.className = "join-btn";
    btnJoin.textContent = group.joined ? "Leave" : "Join";
    btnJoin.setAttribute("aria-pressed", group.joined.toString());
    btnJoin.addEventListener("click", () => toggleJoinGroup(group.id));

    const btnDiscuss = document.createElement("button");
    btnDiscuss.className = "discuss-btn";
    btnDiscuss.textContent = "Discussion";
    btnDiscuss.addEventListener("click", () => openDiscussion(group.id));

    buttons.append(btnJoin, btnDiscuss);
    div.append(title, desc, members, buttons);
    groupList.appendChild(div);
  });
}

// Toggle join/leave group
async function toggleJoinGroup(groupId) {
  if (!isLoggedIn) {
    alert("Please log in to join a book club.");
    openLoginModal();
    return;
  }

  try {
    const groupIndex = groups.findIndex((g) => g.id === groupId);
    if (groupIndex === -1) return;

    const group = groups[groupIndex];
    group.joined = !group.joined;
    group.members += group.joined ? 1 : -1;

    // Update in Firestore
    await db
      .collection("groups")
      .doc(groupId.toString())
      .update({
        joined: group.joined,
        members: group.members,
      });

    renderGroups();
  } catch (error) {
    console.error("Error toggling group membership:", error);
    alert("Failed to update group membership. Please try again.");
  }
}

// Create new group form
groupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!isLoggedIn) {
    alert("Please log in to create a book club.");
    openLoginModal();
    return;
  }

  const name = newGroupName.value.trim();
  if (name) {
    try {
      const newGroup = {
        id: Date.now(),
        name,
        description: "Newly created book club",
        members: 1,
        joined: true,
        discussions: [],
      };

      // Add to Firestore
      await db.collection("groups").doc(newGroup.id.toString()).set(newGroup);

      // Update local state
      groups.push(newGroup);
      newGroupName.value = "";
      renderGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group. Please try again.");
    }
  }
});

// Discussion Modal functions
async function openDiscussion(groupId) {
  if (!isLoggedIn) {
    alert("Please log in to participate in discussions.");
    openLoginModal();
    return;
  }

  try {
    const doc = await db.collection("groups").doc(groupId.toString()).get();
    if (!doc.exists) {
      console.error("Group not found");
      return;
    }

    currentGroup = doc.data();
    discussionTitle.textContent = `Discussion - ${currentGroup.name}`;
    discussionMessages.innerHTML = "";

    currentGroup.discussions.forEach((disc) => {
      addDiscussionMessage(disc.user, disc.message);
    });

    discussionModal.classList.add("active");
    discussionInput.focus();
    document.body.style.overflow = "hidden";
  } catch (error) {
    console.error("Error opening discussion:", error);
  }
}

function closeDiscussion() {
  discussionModal.classList.remove("active");
  discussionInput.value = "";
  document.body.style.overflow = "";
}

// Add message to discussion messages list
function addDiscussionMessage(user, message) {
  const div = document.createElement("div");
  div.className = "discussion-message";
  div.innerHTML = `<strong>${user}:</strong> ${message}`;
  discussionMessages.appendChild(div);
  discussionMessages.scrollTop = discussionMessages.scrollHeight;
}

// Send message in discussion form
discussionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = discussionInput.value.trim();

  if (msg && currentGroup) {
    try {
      const user =
        currentUser.displayName || currentUser.email.split("@")[0];
      const updatedDiscussions = [
        ...currentGroup.discussions,
        { user, message: msg },
      ];

      // Update in Firestore
      await db
        .collection("groups")
        .doc(currentGroup.id.toString())
        .update({
          discussions: updatedDiscussions,
        });

      // Update local state
      currentGroup.discussions = updatedDiscussions;
      const groupIndex = groups.findIndex((g) => g.id === currentGroup.id);
      if (groupIndex !== -1) {
        groups[groupIndex].discussions = updatedDiscussions;
      }

      addDiscussionMessage(user, msg);
      discussionInput.value = "";
      discussionInput.focus();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  }
});

// Toggle between Books and Groups sections
btnBooks.addEventListener("click", () => {
  booksSection.style.display = "block";
  groupsSection.style.display = "none";
  btnBooks.classList.add("active");
  btnClubs.classList.remove("active");
});

btnClubs.addEventListener("click", () => {
  booksSection.style.display = "none";
  groupsSection.style.display = "block";
  btnBooks.classList.remove("active");
  btnClubs.classList.add("active");
  renderGroups();
});

// Genre selection
genreList.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    currentGenre = e.target.dataset.genre;
    Array.from(genreList.children).forEach((li) => {
      li.classList.toggle("active", li.dataset.genre === currentGenre);
    });
    renderBooks();
  }
});

genreList.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && e.target.tagName === "LI") {
    e.preventDefault();
    currentGenre = e.target.dataset.genre;
    Array.from(genreList.children).forEach((li) => {
      li.classList.toggle("active", li.dataset.genre === currentGenre);
    });
    renderBooks();
  }
});

// Close modals
modalClose.addEventListener("click", closeBookModal);
bookModal.addEventListener("click", (e) => {
  if (e.target === bookModal) closeBookModal();
});

discussionClose.addEventListener("click", closeDiscussion);
discussionModal.addEventListener("click", (e) => {
  if (e.target === discussionModal) closeDiscussion();
});

// Close modal on ESC key
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (bookModal.classList.contains("active")) {
      closeBookModal();
    }
    if (discussionModal.classList.contains("active")) {
      closeDiscussion();
    }
    if (loginModal.classList.contains("active")) {
      closeLoginModal();
    }
  }
});

// Login Modal Handling
function openLoginModal() {
  loginModal.classList.add("active");
  loginModal.setAttribute("aria-hidden", "false");
  loginBtn.setAttribute("aria-expanded", "true");
  document.getElementById("email-input").focus();
}

function closeLoginModal() {
  loginModal.classList.remove("active");
  loginModal.setAttribute("aria-hidden", "true");
  loginBtn.setAttribute("aria-expanded", "false");
  isSignUpMode = false;
  toggleAuthModeLink.textContent = "Sign Up";
  document.getElementById("login-modal-title").textContent = "Login";
  usernameInput.style.display = "none";
  loginForm.reset();
}

loginBtn.addEventListener("click", () => {
  if (isLoggedIn) {
    // Logout if already logged in
    auth.signOut();
  } else {
    openLoginModal();
  }
});

loginCloseBtn.addEventListener("click", closeLoginModal);
loginModal.addEventListener("click", (e) => {
  if (e.target === loginModal) closeLoginModal();
});

forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();
  const email = document.getElementById("email-input").value.trim();
  if (!email) {
    alert("Please enter your email to reset your password.");
    return;
  }
  auth
    .sendPasswordResetEmail(email)
    .then(() => {
      alert("Password reset email sent. Check your inbox.");
    })
    .catch((error) => {
      console.error("Error sending password reset email:", error);
      alert(`Failed to send password reset email: ${error.message}`);
    });
});

toggleAuthModeLink.addEventListener("click", (e) => {
  e.preventDefault();
  isSignUpMode = !isSignUpMode;
  document.getElementById("login-modal-title").textContent = isSignUpMode
    ? "Sign Up"
    : "Login";
  toggleAuthModeLink.textContent = isSignUpMode ? "Login" : "Sign Up";
  usernameInput.style.display = isSignUpMode ? "block" : "none";
  loginForm.reset();
});

// Firebase authentication
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const email = document.getElementById("email-input").value.trim();
  const password = document.getElementById("password-input").value.trim();

  if (!email || !password || (isSignUpMode && !username)) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    if (isSignUpMode) {
      // Sign up
      const userCredential = await auth.createUserWithEmailAndPassword(
        email,
        password
      );
      await userCredential.user.updateProfile({ displayName: username });
      currentUser = userCredential.user;
      isLoggedIn = true;
      loginBtn.textContent = "Logout";
      loginForm.reset();
      closeLoginModal();
      alert(`Signed up and logged in as ${email}`);
    } else {
      // Login
      const userCredential = await auth.signInWithEmailAndPassword(
        email,
        password
      );
      currentUser = userCredential.user;
      isLoggedIn = true;
      loginBtn.textContent = "Logout";
      loginForm.reset();
      closeLoginModal();
      alert(`Logged in as ${email}`);
    }
  } catch (error) {
    console.error(`${isSignUpMode ? "Sign up" : "Login"} error:`, error);
    alert(`${isSignUpMode ? "Sign up" : "Login"} failed: ${error.message}`);
  }
});

// Handle auth state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    currentUser = user;
    isLoggedIn = true;
    loginBtn.textContent = "Logout";
    // Pre-fill review form with user's name if available
    if (user.displayName) {
      reviewUser.value = user.displayName;
    } else {
      reviewUser.value = user.email.split("@")[0];
    }
  } else {
    // User is signed out
    currentUser = null;
    isLoggedIn = false;
    loginBtn.textContent = "Login";
  }
});

// DARK/LIGHT MODE TOGGLE
function initMode() {
  const savedMode = localStorage.getItem("mode");
  if (savedMode) {
    if (savedMode === "dark") {
      body.classList.add("dark-mode");
      modeToggle.classList.add("dark");
      modeToggle.setAttribute("aria-checked", "true");
    } else {
      modeToggle.setAttribute("aria-checked", "false");
    }
  } else {
    // No saved preference, use system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      body.classList.add("dark-mode");
      modeToggle.classList.add("dark");
      modeToggle.setAttribute("aria-checked", "true");
    } else {
      modeToggle.setAttribute("aria-checked", "false");
    }
  }
}

function toggleMode() {
  const isDark = body.classList.toggle("dark-mode");
  modeToggle.classList.toggle("dark", isDark);
  modeToggle.setAttribute("aria-checked", isDark.toString());
  localStorage.setItem("mode", isDark ? "dark" : "light");
}

modeToggle.addEventListener("click", toggleMode);
modeToggle.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    toggleMode();
  }
});

// Initialize
initMode();
initData();

