// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
//random categories to be used for each game
let categories = [];

//const URL = 'https://jservice.io';
const NUM_QUESTIONS = 5;
const NUM_CATEGORIES = 6; 



/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

/*
From the api, the following params: 
Options:
count(int): amount of categories to return, limited to 100 at a time
offset(int): offsets the starting id of categories returned. Useful in pagination.
*/

async function getCategoryIds() {
    let response = await axios.get('https://jservice.io/api/categories', {
        params: {
            count: "100",
            offset: Math.floor(Math.random() * (500 - 1) + 1)
        }
    });

    
    // using lodash to pick 6 random categories

    let randomCategories = _.sampleSize(response.data, NUM_CATEGORIES);
    
    // getting catergory ids from randomCategories
    let cIds = randomCategories.map((cObj)  => {
        return cObj.id;
    });
    //returning array of categories
    return cIds; 
   
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    // get category data (response) from API, takes category ID
    let response = await axios.get('https://jservice.io/api/clues', {
        params: {
            category: catId
        }
    });
    // using lodah to pick 6 random clues
    let randomClues = _.sampleSize(response.data, NUM_QUESTIONS);
    //console.log(response[0].category);

    // creating an object with title and clue array
    let title = response.data[0].category.title;
    let clues = randomClues.map((clue) => {
        return {
            question:clue.question,
            answer: clue.answer,
            showing: null
        }
    });
    // returning an object type with category data cosisting of title and arry of clues
    return {title, clues};
}


/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

function fillTable() {
    $('#tableDiv')
        .html('<table id="jeopardy-table" class="table jeopardy-table"><thead id="table-head"></thead ><tbody id="table-body" class="table-body"></tbody>');

    let $tableHead = $('#table-head');
    let $tableBody = $('#table-body');

    let trow = document.createElement('tr');
    let $trow = $(trow);
    $tableHead.append($trow);

    //trow.removeEventListener('click', onclick);

    // adds the category row and each category title
    for (let i = 0; i < NUM_CATEGORIES; i++) {
        let $td = $('<td>');
        $td.text(categories[i].title.toUpperCase());
        $td.attr('class', 'category-row');
        $trow.append($td);
    }
    // loops and adds tds to the table. adds showing class as well as data-coordinates of 
    // what clue should go on that td. These coordinates will be used to show on click.
    for (let y = 0; y < NUM_QUESTIONS; y++) {
        let newRow = document.createElement('tr');
        let $newRow = $(newRow);
        for (let x = 0; x < NUM_CATEGORIES; x++) {
            let $td = $('<td>');
            $td.text('?');
            $td.attr('class', 'showing-null').addClass('valid');
            $td.attr('data-coordinates', `${x}-${y}`);
            $newRow.append($td);
        }
        $tableBody.append($newRow);
    }

}


/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    console.log('handleClick ', evt.target);
    evt.preventDefault();
    let $target = $(evt.target);
    let x = $target.attr('data-coordinates')[0];
    let y = $target.attr('data-coordinates')[2];


    if ($target.hasClass('showing-null')) {
        $target.html(categories[x].clues[y].question);
        $target.removeClass('showing-null').addClass('question');
    } else if ($target.hasClass('question')) {
        $target.removeClass('question').addClass('answer');
        $target.html(categories[x].clues[y].answer);
    }
}



/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $("#tableDiv").empty();
    $("#start").text("Loading...");
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    let spinner = $('#spin-container');
    spinner.empty();
    $("#start").text("Restart");
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    showLoadingView();
    await initialSetup();
    fillTable();
    hideLoadingView();
}

/*
setting up global variable (categories array) with random categories 
and questions/clues pertaining to that category
*/
async function initialSetup() {
    categories = [];
    let catIds = await getCategoryIds();

    for (let id of catIds) {
        let catData = await getCategory(id);
        categories.push(catData);
    }
    return categories;
}

/** On click of start / restart button, set up game. */
$("#start").on("click", async () => {
    setupAndStart();
});


/** On page load, add event handler for clicking clues */
$("#tableDiv").on("click", function(e) {
    handleClick(e);
});
