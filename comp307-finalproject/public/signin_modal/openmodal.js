function openModal() {
    fetch('../signin_modal/signin_modal.html')
        .then(response => response.text())
        .then(html => {
            console.log(html);
            const modalContainer = document.getElementById("modal-target");
            modalContainer.innerHTML = html;

            let innerModal = modalContainer.getElementsByClassName("modal")[0];
            let boundingRect = innerModal.getBoundingClientRect();
            let vw = window.innerWidth;
            innerModal.style.left = `${(vw - boundingRect.width) / 2}px`;
            innerModal.style.top = `-1em`;

            document.body.style.overflow = 'hidden'; 

            //close button
            const closeModalBtn = innerModal.querySelector('.close');
            if (closeModalBtn) {
                closeModalBtn.addEventListener('click', closeModal);
            }

            //escape key
            document.addEventListener('keydown', handleEscapeKey);

            function closeModal() {
                innerModal.remove();
                document.body.style.overflow = ''; 
                document.removeEventListener('keydown', handleEscapeKey); 
            }

            function handleEscapeKey(event) {
                if (event.key === 'Escape' || event.key === 'Esc') { 
                    closeModal();
                }
            }
        })
        .catch(error => {
            console.error('Error loading modal:', error);
        });
}
