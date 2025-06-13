document.addEventListener('DOMContentLoaded', () => {
    // --- Referências aos elementos do DOM ---
    const adCarousels = document.querySelectorAll('.ad-carousel'); // Seleciona todos os carrosséis
    const blockSelectionPopup = document.getElementById('blockSelectionPopup');
    const interestFormPopup = document.getElementById('interestFormPopup');
    const displayAdPopup = document.getElementById('displayAdPopup');

    const closePopups = document.querySelectorAll('.close-popup');
    const blockTypeButtons = document.querySelectorAll('.block-type-btn');
    const interestForm = document.getElementById('interestForm');

    const selectedBlockInfo = document.getElementById('selectedBlockInfo');
    const selectedBlockValueInput = document.getElementById('selectedBlockValue'); // Este deve armazenar o ID do bloco, não o preço

    const adImageInput = document.getElementById('adImage'); // Referência ao input de imagem
    const customButtonTextSelect = document.getElementById('customButtonText'); // Referência ao select de texto do botão
    const customButtonLinkInput = document.getElementById('customButtonLink'); // Referência ao input de link do botão

    const displayAdTitle = document.getElementById('displayAdTitle');
    const displayAdImage = document.getElementById('displayAdImage');
    const displayAdCopy = document.getElementById('displayAdCopy');
    const displayAdButton = document.getElementById('displayAdButton');

    // Variáveis para armazenar informações do bloco selecionado temporariamente
    let selectedBlockId = '';
    let selectedBlockType = '';
    let selectedBlockPrice = '';

    // Simulação de um "banco de dados" de anúncios ocupados
    const advertisedBlocks = {}; // Este objeto estará vazio por padrão

    // Configuração de velocidade do carrossel em pixels por frame/intervalo
    const scrollSpeed = 0.8;

    // Objeto para armazenar o estado de cada carrossel
    const carouselsState = {};

    // --- Funções de Carrossel ---

    // Função para inicializar um carrossel específico
    function initCarousel(carouselElement, carouselId) {
        const originalBlocks = Array.from(carouselElement.children);

        if (originalBlocks.length === 0) {
            console.warn('Nenhum bloco de anúncio encontrado no carrossel:', carouselElement.className);
            return;
        }

        // Remove quaisquer clones existentes antes de adicionar novos (para re-inicialização segura)
        carouselElement.querySelectorAll('.ad-block-clone').forEach(clone => clone.remove());

        // Duplica os blocos originais para garantir uma rolagem contínua suave
        // Adiciona 2 cópias para cada lado para uma rolagem mais longa e suave
        for (let i = 0; i < 2; i++) { // Duplica para a direita (final)
            originalBlocks.forEach(block => {
                const clone = block.cloneNode(true);
                clone.classList.add('ad-block-clone'); // Marca como clone
                carouselElement.appendChild(clone);
            });
        }
        // Adiciona cópias no início para rolagem reversa
        for (let i = 0; i < 2; i++) { // Duplica para a esquerda (início)
            originalBlocks.slice().reverse().forEach(block => { // Inverte para manter a ordem visual
                const clone = block.cloneNode(true);
                clone.classList.add('ad-block-clone'); // Marca como clone
                carouselElement.prepend(clone); // Adiciona no início
            });
        }

        // Adiciona event listeners a TODOS os blocos (originais e clonados)
        const allBlocksInCarousel = carouselElement.querySelectorAll('.ad-block');
        allBlocksInCarousel.forEach(block => {
            block.addEventListener('click', () => {
                const blockId = block.dataset.blockId;
                if (advertisedBlocks[blockId]) {
                    displayExistingAd(blockId, advertisedBlocks[blockId]);
                } else {
                    openBlockSelectionPopup(blockId);
                }
            });
        });

        // Calcula a largura total dos blocos originais para o loop
        let calculatedOriginalWidth = 0;
        originalBlocks.forEach(block => {
            const style = window.getComputedStyle(block);
            const width = block.offsetWidth;
            const marginLeft = parseFloat(style.marginLeft);
            const marginRight = parseFloat(style.marginRight);
            calculatedOriginalWidth += (width + marginLeft + marginRight);
        });

        // Inicializa o estado do carrossel
        carouselsState[carouselId] = {
            element: carouselElement,
            currentTranslateX: 0,
            animationFrameId: null,
            blocks: allBlocksInCarousel,
            originalSetWidth: calculatedOriginalWidth, // Largura de UM conjunto de blocos originais
            // Define a direção: -1 para direita para esquerda, 1 para esquerda para direita
            direction: (carouselId === 'carousel2' || carouselId === 'carousel4') ? -1 : 1
        };

        // Posiciona o carrossel no início da primeira cópia dos blocos originais para rolagem contínua
        // Isso evita um "salto" no início se a rolagem for da direita para a esquerda
        if (carouselsState[carouselId].direction === 1) {
            // Começa no início da primeira cópia dos blocos originais (após as cópias prepend)
            carouselsState[carouselId].currentTranslateX = -carouselsState[carouselId].originalSetWidth * 2;
        } else {
            // Para rolagem reversa, começa no início do segundo conjunto de blocos originais
            // (que é a última cópia antes das cópias prepend)
            carouselsState[carouselId].currentTranslateX = -carouselsState[carouselId].originalSetWidth * 2;
        }
        carouselsState[carouselId].element.style.transform = `translateX(${carouselsState[carouselId].currentTranslateX}px)`;


        startScrolling(carouselId);
    }

    // Função para iniciar a rolagem contínua
    function startScrolling(carouselId) {
        const state = carouselsState[carouselId];
        if (!state || state.animationFrameId) return;

        const animate = () => {
            if (state.direction === 1) { // Rola da esquerda para a direita (negativo)
                state.currentTranslateX -= scrollSpeed;
                // Se a rolagem ultrapassar o ponto onde o segundo conjunto de blocos originais começa
                if (Math.abs(state.currentTranslateX) >= state.originalSetWidth * 3) {
                    state.currentTranslateX = -state.originalSetWidth * 2; // Reseta para o início do primeiro conjunto duplicado
                }
            } else { // Rola da direita para a esquerda (positivo)
                state.currentTranslateX += scrollSpeed;
                // Se a rolagem ultrapassar o ponto onde o primeiro conjunto de blocos originais termina
                if (state.currentTranslateX >= -state.originalSetWidth * 1) {
                    state.currentTranslateX = -state.originalSetWidth * 2; // Reseta para o início do primeiro conjunto duplicado (agora vindo da direita)
                }
            }

            state.element.style.transform = `translateX(${state.currentTranslateX}px)`;
            state.animationFrameId = requestAnimationFrame(animate);
        };

        state.animationFrameId = requestAnimationFrame(animate);
    }

    // --- Funções de Utilitário ---

    // Função para formatar valores como moeda Real
    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    // Função para normalizar URL (adiciona http:// se necessário)
    function normalizeUrl(url) {
        if (!url || url.trim() === '') {
            return '';
        }
        let formattedUrl = url.trim();
        // Verifica se a URL já começa com http:// ou https://
        if (!/^https?:\/\//i.test(formattedUrl)) {
            // Se não, adiciona http://
            formattedUrl = 'http://' + formattedUrl;
        }
        return formattedUrl;
    }

    // --- Funções de Controle de Popup ---

    function showPopup(popupElement) {
        hideAllPopups();
        popupElement.classList.add('active');
        document.body.style.overflow = 'hidden'; // Evita rolagem do body
    }

    function hidePopup(popupElement) {
        popupElement.classList.remove('active');
        document.body.style.overflow = ''; // Restaura rolagem do body
    }

    function hideAllPopups() {
        document.querySelectorAll('.popup-overlay').forEach(popup => {
            popup.classList.remove('active');
        });
        document.body.style.overflow = ''; // Garante que a rolagem do body seja restaurada ao fechar tudo
    }

    closePopups.forEach(button => {
        button.addEventListener('click', () => {
            const parentPopup = button.closest('.popup-overlay');
            if (parentPopup) {
                hidePopup(parentPopup);
            }
            interestForm.reset();
            selectedBlockValueInput.value = '';
            // Revogar URL do objeto se houver, para liberar memória
            if (displayAdImage.src && displayAdImage.src.startsWith('blob:')) {
                URL.revokeObjectURL(displayAdImage.src);
                displayAdImage.src = '';
                displayAdImage.style.display = 'none'; // Esconde a imagem se não houver
            }
        });
    });

    document.querySelectorAll('.popup-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                hidePopup(overlay);
                interestForm.reset();
                selectedBlockValueInput.value = '';
                // Revogar URL do objeto se houver
                if (displayAdImage.src && displayAdImage.src.startsWith('blob:')) {
                    URL.revokeObjectURL(displayAdImage.src);
                    displayAdImage.src = '';
                    displayAdImage.style.display = 'none';
                }
            }
        });
    });

    // --- Lógica de Seleção de Bloco e Abertura de Formulário ---

    function openBlockSelectionPopup(blockId) {
        selectedBlockId = blockId;
        showPopup(blockSelectionPopup);
    }

    blockTypeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            selectedBlockType = event.currentTarget.dataset.blockType;
            selectedBlockPrice = event.currentTarget.dataset.blockValue;

            const formattedPrice = formatCurrency(selectedBlockPrice);
            selectedBlockInfo.innerHTML = `Você selecionou o bloco: <strong>${selectedBlockId}</strong> (Tipo ${selectedBlockType}, Valor: ${formattedPrice}).`;

            selectedBlockValueInput.value = selectedBlockId;

            hidePopup(blockSelectionPopup);
            showPopup(interestFormPopup);
        });
    });

    // --- Lógica de Envio do Formulário de Interesse ---
    interestForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(interestForm);

        // Validação da imagem obrigatória
        const adImageFile = formData.get('adImage');
        if (!adImageFile || adImageFile.size === 0) {
            alert('Por favor, selecione uma imagem ou GIF para o seu anúncio.');
            return; // Impede o envio do formulário
        }

        const adData = {
            blockId: selectedBlockId,
            blockType: selectedBlockType,
            blockPrice: selectedBlockPrice,
            userName: formData.get('userName'),
            userEmail: formData.get('userEmail'),
            adCopy: formData.get('adCopy'),
            buttonText: formData.get('customButtonText'),
            buttonLink: formData.get('customButtonLink')
        };

        if (adData.buttonText && adData.buttonText.trim() !== '') {
            if (!adData.buttonLink || adData.buttonLink.trim() === '') {
                alert('Por favor, insira um link para o botão de chamada para ação.');
                return;
            }
            adData.buttonLink = normalizeUrl(adData.buttonLink);
        } else {
            adData.buttonText = '';
            adData.buttonLink = '';
        }

        adData.imageUrl = URL.createObjectURL(adImageFile);

        advertisedBlocks[selectedBlockId] = adData;
        console.log('Anúncio Salvo Localmente (simulado):', adData);

        // --- ATUALIZAÇÃO: ANEXAR IMAGEM E BOTÃO NO BLOCO DO CARROSSEL ---
        const allBlockElementsInCarousels = document.querySelectorAll(`.ad-block[data-block-id="${selectedBlockId}"]`);
        allBlockElementsInCarousels.forEach(blockElementInCarousel => {
            if (blockElementInCarousel) {
                blockElementInCarousel.classList.add('occupied');

                const placeholderTextSpan = blockElementInCarousel.querySelector('.placeholder-text');
                if (placeholderTextSpan) {
                    placeholderTextSpan.style.display = 'none';
                }

                const blockImage = blockElementInCarousel.querySelector('.ad-block-image');
                if (blockImage) {
                    blockImage.src = adData.imageUrl;
                    blockImage.style.display = 'block';
                }

                const blockButton = blockElementInCarousel.querySelector('.ad-block-button');
                if (blockButton) {
                    if (adData.buttonText && adData.buttonLink) {
                        blockButton.textContent = adData.buttonText;
                        blockButton.href = adData.buttonLink;
                        blockButton.style.display = 'inline-block';
                    } else {
                        blockButton.style.display = 'none';
                    }
                }
            }
        });

        displayAdTitle.textContent = `Anúncio no Bloco ${adData.blockId}`;
        if (adData.imageUrl) {
            displayAdImage.src = adData.imageUrl;
            displayAdImage.style.display = 'block';
        } else {
            displayAdImage.src = '';
            displayAdImage.style.display = 'none';
        }
        displayAdImage.alt = `Imagem do Anúncio ${adData.blockId}`;
        displayAdCopy.textContent = adData.adCopy;

        if (adData.buttonText && adData.buttonLink) {
            displayAdButton.textContent = adData.buttonText;
            displayAdButton.href = adData.buttonLink;
            displayAdButton.style.display = 'inline-block';
        } else {
            displayAdButton.textContent = '';
            displayAdButton.href = '#';
            displayAdButton.style.display = 'none';
        }

        hidePopup(interestFormPopup);
        showPopup(displayAdPopup);

        interestForm.reset();
        selectedBlockValueInput.value = '';
    });

    function displayExistingAd(blockId, adData) {
        displayAdTitle.textContent = `Anúncio no Bloco ${blockId}`;

        if (adData.imageUrl) {
            displayAdImage.src = adData.imageUrl;
            displayAdImage.style.display = 'block';
        } else {
            displayAdImage.src = '';
            displayAdImage.style.display = 'none';
        }
        displayAdImage.alt = `Imagem do Anúncio ${blockId}`;
        displayAdCopy.textContent = adData.adCopy;

        if (adData.buttonText && adData.buttonLink) {
            displayAdButton.textContent = adData.buttonText;
            displayAdButton.href = adData.buttonLink;
            displayAdButton.style.display = 'inline-block';
        } else {
            displayAdButton.textContent = '';
            displayAdButton.href = '#';
            displayAdButton.style.display = 'none';
        }

        showPopup(displayAdPopup);
    }

    // --- Event Listeners para validação de campos do botão (opcional) ---
    customButtonTextSelect.addEventListener('change', () => {
        if (customButtonTextSelect.value !== '') {
            customButtonLinkInput.setAttribute('required', 'required');
            customButtonLinkInput.setAttribute('placeholder', 'seusite.com.br (obrigatório)');
        } else {
            customButtonLinkInput.removeAttribute('required');
            customButtonLinkInput.setAttribute('placeholder', 'seusite.com.br');
            customButtonLinkInput.value = '';
        }
    });

    // --- Funcionalidade do FAQ (Acordeão) ---
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const toggleIcon = question.querySelector('.faq-toggle-icon');

            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== question) {
                    otherQuestion.classList.remove('active');
                    otherQuestion.nextElementSibling.style.maxHeight = null;
                    otherQuestion.querySelector('.faq-toggle-icon').style.transform = 'rotate(0deg)';
                }
            });

            question.classList.toggle('active');
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                toggleIcon.style.transform = 'rotate(0deg)';
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
                toggleIcon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // --- Inicialização ao Carregar a Página ---
    adCarousels.forEach((carousel, index) => {
        initCarousel(carousel, `carousel${index + 1}`);
    });

    // A função renderExistingAds() e loadSampleAds() foram removidas.
    // Os carrosséis iniciarão vazios e os anúncios serão adicionados ao serem preenchidos pelo formulário.
});