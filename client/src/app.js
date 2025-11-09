// 1. Get all the elements we need from the HTML
const dashboardView = document.getElementById('dashboard-view');
const entryView = document.getElementById('entry-view');
const allNavButtons = document.querySelectorAll('.nav-button');

const homeButton = document.getElementById('home-button');
const addNewButton = document.getElementById('add-new-button');


// 2. Reusable function to switch the view AND the active button style
function switchAppView(viewToShow, buttonToActivate) {
    
    // --- VIEW SWITCHING: Hide all, then show one ---
    dashboardView.style.display = 'none';
    entryView.style.display = 'none';
    viewToShow.style.display = 'block';
    
    // --- BUTTON STYLING: Make all inactive, then make one active ---
    allNavButtons.forEach(btn => {
        btn.classList.remove('active-nav-button');
    });

    buttonToActivate.classList.add('active-nav-button');
}


// 3. Attach click actions (Event Listeners)
// Click on 'home' button
homeButton.addEventListener('click', function() {
    switchAppView(dashboardView, homeButton);
});

// Click on 'add new' button
addNewButton.addEventListener('click', function() {
    switchAppView(entryView, addNewButton);
});

// Initial setup: Show the Dashboard when the page first loads
switchAppView(dashboardView, homeButton);