const reviewBtn = document.querySelector('#review-btn');
const writeReview = document.querySelector('.review__writeReview');
const url = window.location.href;
const productId = url.slice(url.length - 24);

function reload() {
    setTimeout(() => {
        location.reload();
    }, 1000);
}

async function fetchReviews() {
    writeReview.innerHTML = '';
    // TODO: post data to neo4j using fetch and retrieve response
    // if response === success { fetch new data }
    const reviewContainer = document.querySelector('.review__container');

    const res = await fetch(`http://localhost:3000/review/${productId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const reviews = await res.json();
    const reviewHTML = reviews.forEach((review, index) => {
        reviewContainer.innerHTML += `<div class="review__content">
            <h3>User: ${review.email}</h3>
            <p>${review.content}</p>
            <button class="btn-reply btn">Reply</button>
        </div>`;
        if (review.reply) {
            review.reply.forEach((item) => {
                reviewContainer.innerHTML += `<div class="review__allReplies">
                <div class="review__reply">
                  <h3>User: ${item.email}</h3>
                  <p>${item.content}</p>
               </div>
            </div>`;
            });
        }

        const csrf = document.getElementById('rf').value;
        const form = document.createElement('form');
        form.className = 'form-control reply-form hide';
        form.style.paddingLeft = '60px';
        form.action = '/reply';
        form.method = 'POST';
        form.innerHTML += ` <input type="hidden" name="_csrf" value="${csrf}" />
            <input type="hidden" value="${productId}" name="productId">
            <input type="hidden" value="${index}" name="index">
           <textarea name="reply" rows="2"></textarea>
           <button class="btn" onclick="reload()" >Submit</button>`;

        reviewContainer.append(form);
    });

    // add event for reply buttons
    const replyBtns = document.querySelectorAll('.review__content > .btn-reply');
    const replyInners = document.querySelectorAll('.form-control.reply-form');
    replyBtns.forEach(function (btn, i) {
        btn.addEventListener('click', function () {
            replyInners[i].classList.toggle('hide');
        });
    });
    addSubmitReplyEvents();
}

// add event for submit buttons that shown when click reply buttons
function addSubmitReplyEvents() {
    const submitReplyBtns = document.querySelectorAll('.form-control.reply-form > .btn');
    const replyInners = document.querySelectorAll('.form-control.reply-form');
    submitReplyBtns.forEach(function (btn, i) {
        btn.addEventListener('click', function () {
            // TODO: post data to server
            replyInners[i].classList.add('hide');
            fetchReviews();
        });
    });
}

(function init() {
    if (reviewBtn) {
        reviewBtn.addEventListener('click', function () {
            document.getElementById('review-form').style.display = 'block';
            const btn = document.querySelector('#review-form .btn');
            btn.addEventListener('click', async function () {
                // TODO: post data to server
                await postReview();
                setTimeout(() => {
                    location.reload();
                }, 200);
            });
        });
    }
    fetchReviews();
})();
