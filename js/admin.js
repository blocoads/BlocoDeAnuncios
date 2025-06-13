// js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores de Elementos ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const saveAllButton = document.getElementById('save-all-button');

    // Elementos do Modal de Configuração
    const blockConfigPopup = document.getElementById('blockConfigPopup');
    const currentBlockIdSpan = document.getElementById('currentBlockId');
    const popupAdCopy = document.getElementById('popupAdCopy');
    const popupButtonText = document.getElementById('popupButtonText');
    const popupButtonLink = document.getElementById('popupButtonLink');
    const popupImageUpload = document.getElementById('popupImageUpload');
    const popupImagePreview = document.getElementById('popupImagePreview');
    const popupRemoveImageBtn = document.getElementById('popupRemoveImageBtn');
    const popupDuration = document.getElementById('popupDuration');
    const popupClearButton = document.getElementById('popupClearButton');
    const popupActivateButton = document.getElementById('popupActivateButton');
    const popupCloseButton = document.getElementById('popupCloseButton');

    let currentEditingBlock = null; // Guarda a referência do bloco sendo editado no modal
    const LOCAL_STORAGE_KEY = 'adBlocksData'; // Chave para o localStorage

    // --- Inicialização de Dados ---
    let allAdBlocks = loadBlocksFromLocalStorage();

    // Adicionado um ponto de validação mais robusto
    if (!allAdBlocks || !validateBlockStructure(allAdBlocks)) {
        console.warn("Dados do localStorage ausentes ou com estrutura inválida. Inicializando blocos padrão.");
        allAdBlocks = initializeDefaultBlocks();
        saveBlocksToLocalStorage(allAdBlocks); // Salva os blocos iniciais
    }


    // --- Funções Auxiliares de Dados ---

    function loadBlocksFromLocalStorage() {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (data) {
            try {
                const parsedData = JSON.parse(data);
                // Garante que o campo imageFile (para upload) exista e seja null inicialmente
                return parsedData.map(block => ({ ...block, imageFile: null }));
            } catch (e) {
                console.error("Erro ao fazer parse dos dados do localStorage:", e);
                return null; // Retorna null para forçar a inicialização padrão
            }
        }
        return null; // Retorna null se não houver dados
    }

    function saveBlocksToLocalStorage(blocks) {
        // Remove o campo imageFile antes de salvar no localStorage, pois File não é serializável
        const serializableBlocks = blocks.map(block => {
            const newBlock = { ...block };
            delete newBlock.imageFile;
            return newBlock;
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serializableBlocks));
    }

    // Valida a estrutura dos blocos para garantir as quantidades corretas: 10 A, 10 B, 10 C
    function validateBlockStructure(blocks) {
        const expectedCounts = { 'A': 10, 'B': 10, 'C': 10 }; // Corrigido para 10, 10, 10
        const actualCounts = { 'A': 0, 'B': 0, 'C': 0 };

        if (!blocks || blocks.length !== (expectedCounts.A + expectedCounts.B + expectedCounts.C)) {
            return false; // Quantidade total de blocos não confere
        }

        blocks.forEach(block => {
            if (actualCounts.hasOwnProperty(block.type)) {
                actualCounts[block.type]++;
            }
        });

        // Verifica se cada tipo tem a quantidade esperada
        return Object.keys(expectedCounts).every(type => actualCounts[type] === expectedCounts[type]);
    }

    function initializeDefaultBlocks() {
        const blocks = [];
        const placeholderImageBase = 'https://via.placeholder.com/';

        // Tipo A (Grandes) - 10 Blocos
        for (let i = 1; i <= 10; i++) { // Corrigido para 10 blocos A
            blocks.push({
                id: `A${i}`,
                type: 'A',
                inUse: false,
                durationDays: 0,
                imageUrl: '',
                adCopy: '',
                buttonText: '',
                buttonLink: '',
                imageFile: null // Campo temporário para o arquivo de imagem
            });
        }
        // Exemplo de blocos A ativos
        blocks[0].inUse = true; blocks[0].durationDays = 5; blocks[0].imageUrl = `${placeholderImageBase}250x180?text=Anuncio+A1`; blocks[0].adCopy = 'Inovação e tecnologia para o seu futuro. Não perca!'; blocks[0].buttonText = 'Saiba Mais'; blocks[0].buttonLink = 'https://seusite.com/produto-a1';
        blocks[2].inUse = true; blocks[2].durationDays = 2; blocks[2].imageUrl = `${placeholderImageBase}250x180?text=Anuncio+A3`; blocks[2].adCopy = 'Transforme seu negócio com nossa consultoria estratégica.'; blocks[2].buttonText = 'Agende uma reunião'; blocks[2].buttonLink = 'https://seusite.com/consultoria';


        // Tipo B (Médios) - 10 Blocos
        for (let i = 1; i <= 10; i++) { // Corrigido para 10 blocos B
            blocks.push({
                id: `B${i}`,
                type: 'B',
                inUse: false,
                durationDays: 0,
                imageUrl: '',
                adCopy: '',
                buttonText: '',
                buttonLink: '',
                imageFile: null
            });
        }
         // Exemplo de blocos B ativos
        const offsetB = 10; // Os blocos B começam após os 10 blocos A
        blocks[offsetB + 0].inUse = true; blocks[offsetB + 0].durationDays = 6; blocks[offsetB + 0].imageUrl = `${placeholderImageBase}180x120?text=Anuncio+B1`; blocks[offsetB + 0].adCopy = 'As melhores ofertas da semana estão aqui! Aproveite já!'; blocks[offsetB + 0].buttonText = 'Ver Ofertas'; blocks[offsetB + 0].buttonLink = 'https://seusite.com/ofertas';
        blocks[offsetB + 2].inUse = true; blocks[offsetB + 2].durationDays = 1; blocks[offsetB + 2].imageUrl = `${placeholderImageBase}180x120?text=Anuncio+B3`; blocks[offsetB + 2].adCopy = 'Desenvolva suas habilidades com nossos cursos online.'; blocks[offsetB + 2].buttonText = 'Inscreva-se'; blocks[offsetB + 2].buttonLink = 'https://seusite.com/cursos';
        blocks[offsetB + 5].inUse = true; blocks[offsetB + 5].durationDays = 3; blocks[offsetB + 5].imageUrl = `${placeholderImageBase}180x120?text=Anuncio+B6`; blocks[offsetB + 5].adCopy = 'Descubra a liberdade financeira com nossos investimentos.'; blocks[offsetB + 5].buttonText = 'Invista Agora'; blocks[offsetB + 5].buttonLink = 'https://seusite.com/investimentos';


        // Tipo C (Pequenos) - 10 Blocos
        for (let i = 1; i <= 10; i++) { // Corrigido para 10 blocos C
            blocks.push({
                id: `C${i}`,
                type: 'C',
                inUse: false,
                durationDays: 0,
                imageUrl: '',
                adCopy: '',
                buttonText: '',
                buttonLink: '',
                imageFile: null
            });
        }
        // Exemplo de blocos C ativos
        const offsetC = 10 + 10; // Os blocos C começam após os 10 blocos A e 10 blocos B
        blocks[offsetC + 0].inUse = true; blocks[offsetC + 0].durationDays = 3; blocks[offsetC + 0].imageUrl = `${placeholderImageBase}120x90?text=Anuncio+C1`; blocks[offsetC + 0].adCopy = 'Café fresco todos os dias na sua porta!'; blocks[offsetC + 0].buttonText = 'Peça Agora'; blocks[offsetC + 0].buttonLink = 'https://seusite.com/cafe';
        blocks[offsetC + 4].inUse = true; blocks[offsetC + 4].durationDays = 4; blocks[offsetC + 4].imageUrl = `${placeholderImageBase}120x90?text=Anuncio+C5`; blocks[offsetC + 4].adCopy = 'Ferramentas essenciais para seu home office.'; blocks[offsetC + 4].buttonText = 'Visite a Loja'; blocks[offsetC + 4].buttonLink = 'https://seusite.com/ferramentas';
        blocks[offsetC + 9].inUse = true; blocks[offsetC + 9].durationDays = 7; blocks[offsetC + 9].imageUrl = `${placeholderImageBase}120x90?text=Anuncio+C10`; blocks[offsetC + 9].adCopy = 'Receitas rápidas e saborosas para o seu dia a dia.'; blocks[offsetC + 9].buttonText = 'Ver Receitas'; blocks[offsetC + 9].buttonLink = 'https://seusite.com/receitas';


        return blocks;
    }

    // --- Funções de Renderização e Eventos ---

    // Renderiza todos os blocos nas suas respectivas abas
    function renderBlocks() {
        ['A', 'B', 'C'].forEach(type => {
            const container = document.getElementById(`blocks-container-${type}`);
            const countDisplay = document.getElementById(`count-${type}`);
            container.innerHTML = ''; // Limpa o container antes de renderizar

            const blocksOfType = allAdBlocks.filter(block => block.type === type);
            countDisplay.textContent = `(${blocksOfType.length} blocos)`; // Atualiza a contagem

            blocksOfType.forEach(block => {
                const blockElement = document.createElement('div');
                blockElement.classList.add('admin-block-item');
                blockElement.classList.add(block.inUse ? 'in-use' : 'available');
                blockElement.dataset.blockId = block.id; // Adiciona o ID como data-attribute

                const daysRemaining = block.inUse ? block.durationDays : 0;
                const statusText = block.inUse ? `Em Uso (${daysRemaining} dias)` : 'Disponível';
                const statusClass = block.inUse ? 'status-in-use' : 'status-available';

                blockElement.innerHTML = `
                    <h3>Bloco ${block.id} <span class="status-indicator ${statusClass}">${statusText}</span></h3>
                    <div class="block-preview">
                        <img src="${block.imageUrl || 'https://via.placeholder.com/150x100?text=Sem+Imagem'}" alt="Prévia do Anúncio">
                        <p>${block.adCopy || 'Clique para configurar...'}</p>
                        ${block.buttonText && block.buttonLink ? `<a href="${block.buttonLink}" target="_blank" class="preview-button">${block.buttonText}</a>` : ''}
                    </div>
                    <button class="btn-edit-block" data-block-id="${block.id}">Configurar Bloco ⚙️</button>
                `;
                container.appendChild(blockElement);
            });
        });

        // Adiciona listeners para os botões "Configurar Bloco" após a renderização
        document.querySelectorAll('.btn-edit-block').forEach(button => {
            button.addEventListener('click', (event) => {
                const blockId = event.target.dataset.blockId;
                openBlockConfigModal(blockId);
            });
        });
    }

    // --- Funções do Modal de Configuração ---

    function openBlockConfigModal(blockId) {
        currentEditingBlock = allAdBlocks.find(b => b.id === blockId);

        if (!currentEditingBlock) {
            console.error('Bloco não encontrado:', blockId);
            return;
        }

        currentBlockIdSpan.textContent = currentEditingBlock.id;
        popupAdCopy.value = currentEditingBlock.adCopy;
        popupButtonText.value = currentEditingBlock.buttonText;
        popupButtonLink.value = currentEditingBlock.buttonLink;
        popupImagePreview.src = currentEditingBlock.imageUrl || 'https://via.placeholder.com/150x100?text=Sem+Imagem';
        popupDuration.value = currentEditingBlock.durationDays;
        popupImageUpload.value = ''; // Limpa o input de arquivo

        // Habilita/desabilita campos baseado no status 'inUse'
        const isBlockActive = currentEditingBlock.inUse;
        popupAdCopy.disabled = isBlockActive;
        popupButtonText.disabled = isBlockActive;
        popupButtonLink.disabled = isBlockActive;
        popupImageUpload.disabled = isBlockActive;
        popupRemoveImageBtn.disabled = isBlockActive || !currentEditingBlock.imageUrl; // Desabilita se não tiver imagem
        popupClearButton.style.display = 'inline-block'; // Sempre visível
        popupActivateButton.style.display = isBlockActive ? 'none' : 'inline-block'; // Exibe "Ativar" se não estiver em uso

        blockConfigPopup.classList.add('active');
    }

    function closeBlockConfigModal() {
        blockConfigPopup.classList.remove('active');
        currentEditingBlock = null; // Limpa o bloco em edição
        renderBlocks(); // Re-renderiza para atualizar o painel principal com as últimas alterações
    }

    // --- Listeners para o Modal ---
    popupCloseButton.addEventListener('click', closeBlockConfigModal);
    blockConfigPopup.addEventListener('click', (event) => {
        if (event.target === blockConfigPopup) { // Fecha apenas se clicar no overlay (fora do conteúdo)
            closeBlockConfigModal();
        }
    });

    popupAdCopy.addEventListener('input', (e) => {
        if (currentEditingBlock) currentEditingBlock.adCopy = e.target.value;
    });
    popupButtonText.addEventListener('input', (e) => {
        if (currentEditingBlock) currentEditingBlock.buttonText = e.target.value;
    });
    popupButtonLink.addEventListener('input', (e) => {
        if (currentEditingBlock) currentEditingBlock.buttonLink = e.target.value;
    });

    popupImageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (currentEditingBlock && file) {
            // Verifica o tamanho do arquivo (ex: máximo de 2MB)
            const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
            if (file.size > MAX_FILE_SIZE) {
                alert('A imagem é muito grande! Por favor, selecione uma imagem de até 2MB.');
                popupImageUpload.value = ''; // Limpa o input
                return;
            }

            currentEditingBlock.imageFile = file; // Guarda o objeto File temporariamente

            const reader = new FileReader();
            reader.onload = (e) => {
                popupImagePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
            popupRemoveImageBtn.disabled = false; // Habilita o botão remover
        }
    });

    popupRemoveImageBtn.addEventListener('click', () => {
        if (currentEditingBlock && confirm('Tem certeza que deseja REMOVER a imagem deste bloco?')) {
            currentEditingBlock.imageUrl = '';
            currentEditingBlock.imageFile = null; // Zera o arquivo de imagem em cache
            popupImagePreview.src = 'https://via.placeholder.com/150x100?text=Sem+Imagem';
            popupRemoveImageBtn.disabled = true;
            // A mudança será persistida apenas ao "Salvar Todas as Alterações"
            alert('Imagem marcada para remoção. Clique em "Salvar Todas as Alterações" para aplicar.');
        }
    });

    popupClearButton.addEventListener('click', () => {
        if (currentEditingBlock && confirm(`Tem certeza que deseja LIMPAR o anúncio do Bloco ${currentEditingBlock.id}?`)) {
            currentEditingBlock.inUse = false;
            currentEditingBlock.durationDays = 0;
            currentEditingBlock.imageUrl = '';
            currentEditingBlock.adCopy = '';
            currentEditingBlock.buttonText = '';
            currentEditingBlock.buttonLink = '';
            currentEditingBlock.imageFile = null; // Zera o arquivo de imagem em cache
            alert(`Bloco ${currentEditingBlock.id} limpo com sucesso! Clique em "Salvar Todas as Alterações" para aplicar.`);
            closeBlockConfigModal(); // Fecha o modal e atualiza o painel
        }
    });

    popupActivateButton.addEventListener('click', () => {
        if (currentEditingBlock && confirm(`Tem certeza que deseja ATIVAR o anúncio do Bloco ${currentEditingBlock.id}?`)) {
            // Verifica se os campos essenciais estão preenchidos antes de ativar
            if (!currentEditingBlock.adCopy || (!currentEditingBlock.imageUrl && !currentEditingBlock.imageFile)) {
                alert('Para ativar, o bloco precisa ter uma "Copy do Anúncio" e uma "Imagem/GIF" definidos.');
                return;
            }

            currentEditingBlock.inUse = true;
            currentEditingBlock.durationDays = 7; // Define duração padrão de 7 dias
            alert(`Bloco ${currentEditingBlock.id} ativado por 7 dias! Clique em "Salvar Todas as Alterações" para aplicar.`);
            closeBlockConfigModal(); // Fecha o modal e atualiza o painel
        }
    });

    // --- Gerenciamento de Abas ---
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });

    // --- Salvar Todas as Alterações (Persistência no localStorage) ---
    saveAllButton.addEventListener('click', async () => {
        saveAllButton.textContent = 'Salvando... ⏳';
        saveAllButton.disabled = true;

        // Nesta simulação, o "upload" de imagem é apenas a conversão para Data URL.
        // Em um ambiente real com Netlify Functions, você faria o upload aqui.
        for (const block of allAdBlocks) {
            // Se o bloco tiver um imageFile (novo upload), converte para URL
            if (block.imageFile instanceof File) {
                try {
                    const imageUrl = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.onerror = (e) => reject(e);
                        reader.readAsDataURL(block.imageFile);
                    });
                    block.imageUrl = imageUrl;
                } catch (error) {
                    console.error(`Erro ao converter imagem para Bloco ${block.id}:`, error);
                    alert(`Erro ao processar imagem para Bloco ${block.id}. As alterações do bloco não foram salvas.`);
                    // Continua para o próximo bloco mesmo com erro na imagem
                }
            }
            // Remove o objeto File após processar/antes de salvar no localStorage
            delete block.imageFile;
        }

        saveBlocksToLocalStorage(allAdBlocks); // Salva o estado atual no localStorage

        saveAllButton.textContent = 'Salvo! ✅';
        setTimeout(() => {
            saveAllButton.textContent = 'Salvar Todas as Alterações ✅';
            saveAllButton.disabled = false;
        }, 2000);

        renderBlocks(); // Re-renderiza para garantir que todos os estados estejam visíveis
        alert('Todas as alterações foram salvas com sucesso no seu navegador!');
        console.log('Dados salvos no localStorage:', allAdBlocks);
    });

    // --- Inicialização ---
    renderBlocks(); // Renderiza os blocos ao carregar a página
});