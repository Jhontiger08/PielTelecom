/**
 * @file Script principal para a página da Piel Telecom.
 * @summary Gerencia a interatividade do menu, modais, formulários, e as IAs de recomendação e conversação.
 * @author Seu Nome/Empresa (revisado por IA do Google)
 * @version 2.3.0
 */

document.addEventListener('DOMContentLoaded', () => {

    /**
     * @module App
     * @description Objeto principal que encapsula toda a lógica da aplicação.
     */
    const App = {
        /**
         * Configurações estáticas e chaves da aplicação.
         */
        config: {
            whatsappNumber: '5513991830277',
            geminiApiKey: "AIzaSyDB3RFLt-hjYFWhtBKyqgVodWt4LqNoe_w", // Sua chave da API Google Gemini
            viacepUrl: 'https://viacep.com.br/ws/',
            geminiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=',
            desktopBreakpoint: '(min-width: 1024px)', // Ponto de quebra para layout de desktop (Tailwind lg:)
        },

        /**
         * Estado dinâmico da aplicação, que muda durante a interação do usuário.
         */
        state: {
            selectedPlanInfo: {},
            availableCities: [],
            allPlans: [],
            flickityRecommended: null, // Guarda a instância do carrossel de recomendados
        },

        /**
         * Cache dos nós do DOM para evitar buscas repetidas.
         */
        nodes: {},

        /**
         * Ponto de entrada da aplicação. Inicia todos os componentes.
         */
        init() {
            this._mapDOMNodes();
            this._setupState();
            this._bindEvents();
            this._initPlugins();
            this.jarvis.init(this); // Inicializa o módulo Jarvis
            console.log("Aplicação Piel Telecom inicializada com sucesso. 🚀");
        },

        // =======================================================
        // MÉTODOS DE INICIALIZAÇÃO E CONFIGURAÇÃO
        // =======================================================

        /**
         * Mapeia os elementos do DOM para o objeto `nodes` para fácil acesso.
         * @private
         */
        _mapDOMNodes() {
            const nodeSelectors = {
                // Navegação
                menuBtn: '#menu-btn', mobileMenu: '#mobile-menu', menuIconOpen: '#menu-icon-open', menuIconClose: '#menu-icon-close', mobileMenuLinks: '.mobile-menu-link',
                // Animações
                fadeInElements: '.fade-in-element',
                // Carrosséis
                promoCarousel: '#promo-carousel',
                // Recomendador IA
                recommendBtn: '#recommend-btn', needsInput: '#needs-input', recommendLoader: '#recommend-loader', recommenderError: '#recommender-error', recommendedContainer: '#recommended-plans-container', recommendedGrid: '#recommended-plans-grid', allPlansContainer: '#all-plans-container', allPlansStorage: '#all-plans-storage',
                // Modal de Cidade
                cityModal: '#city-modal', cityModalPanel: '#city-modal-panel', closeCityModalBtn: '#close-city-modal-btn', citySearchInput: '#city-search-input', cityListContainer: '#city-list-container', cityListError: '#city-list-error', confirmCityBtn: '#confirm-city-btn',
                // Modal de Checkout
                checkoutModal: '#checkout-modal', closeModalBtn: '#close-modal-btn', selectedPlanNameSpan: '#selected-plan-name',
                // Formulário WhatsApp
                whatsappFormContainer: '#whatsapp-form-container', whatsappSuccessContainer: '#whatsapp-success', whatsappForm: '#whatsapp-form', whatsappSendLink: '#whatsapp-send-link', radioLabels: '.form-radio-label', radioError: '#radio-error-message',
                // Inputs do Formulário
                cepInput: '#wa-cep', cpfInput: '#wa-cpf', telInput: '#wa-tel1', ruaInput: '#wa-rua', bairroInput: '#wa-bairro', cidadeInput: '#wa-cidade',
            };
            for (const key in nodeSelectors) {
                const selector = nodeSelectors[key];
                if (key.endsWith('Links') || key.endsWith('Elements') || key.endsWith('Labels')) {
                    this.nodes[key] = document.querySelectorAll(selector);
                } else {
                    this.nodes[key] = document.querySelector(selector);
                }
            }
        },
        
        /**
         * Configura o estado inicial da aplicação, como a lista de cidades e planos.
         * @private
         */
        _setupState() {
            const citiesString = "Aguaí, Águas de Santa Bárbara, Agudos, Alumínio, Americana, Américo Brasiliense, Amparo, Angatuba, Araçariguama, Araçoiaba da Serra, Arandu, Araraquara, Araras, Arealva, Areiópolis, Artur Nogueira, Atibaia, Avaí, Avaré, Bady Bassitt, Barra Bonita, Barretos, Bauru, Bebedouro, Biritiba-Mirim, Boa Esperança do Sul, Bocaina, Bofete, Boituva, Bom Jesus dos Perdões, Borborema, Borebi, Botucatu, Bragança Paulista, Cabreúva, Caçapava, Cafelândia, Caieiras, Campina do Monte Alegre, Campinas, Campo Limpo Paulista, Cândido Rodrigues, Capela do Alto, Capivari, Casa Branca, Cedral, Cerqueira César, Cerquilho, Cesário Lange, Colina, Conchal, Conchas, Cordeirópolis, Cosmópolis, Cravinhos, Cristais Paulista, Cubatão, Descalvado, Dobrada, Dois Córregos, Dourado, Elias Fausto, Engenheiro Coelho, Estiva Gerbi, Fernando Prestes, Franca, Francisco Morato, Franco da Rocha, Gavião Peixoto, Guaíra, Guapiaçu, Guarantã, Guararema, Guariba, Guarujá, Guatapará, Holambra, Hortolândia, Iaras, Ibaté, Ibitinga, Igaraçu do Tietê, Igaratá, Indaiatuba, Iperó, Iracemápolis, Itaí, Itajobi, Itaju, Itanhaém, Itapetininga, Itápolis, Itapuí, Itatinga, Itirapuã, Itu, Itupeva, Jaborandi, Jaboticabal, Jacareí, Jaguariúna, Jarinu, Jaú, Jumirim, Jundiaí, Laranjal Paulista, Leme, Lençóis Paulista, Limeira, Lindóia, Lins, Louveira, Macatuba, Mairiporã, Manduri, Matão, Mineiros do Tietê, Mirassol, Mogi das Cruzes, Mogi Guaçu, Mogi Mirim, Mongaguá, Monte Alegre do Sul, Monte Alto, Monte Mor, Motuca, Nazaré Paulista, Nova Europa, Nova Odessa, Óleo, Olímpia, Paranapanema, Pardinho, Patrocínio Paulista, Paulínia, Pederneiras, Pedreira, Pereiras, Peruíbe, Pilar do Sul, Pindorama, Piracaia, Piracicaba, Pirajuí, Pirassununga, Piratininga, Pitangueiras, Porangaba, Porto Ferreira, Praia Grande, Pratânia, Presidente Alves, Quadra, Rafard, Ribeirão Bonito, Ribeirão Corrente, Ribeirão Preto, Rincão, Rio Claro, Rio das Pedras, Salesópolis, Saltinho, Salto de Pirapora, Santa Adélia, Santa Bárbara D’Oeste, Santa Branca, Santa Cruz das Palmeiras, Santa Ernestina, Santa Gertrudes, Santa Lúcia, Santa Rita do Passa Quatro, Santa Rosa de Viterbo, Santo Antônio de Posse, Santos, São Bernardo do Campo, São Carlos, São José do Rio Preto, São José dos Campos, São Manuel, São Vicente, Sarapuí, Serra Azul, Serra Negra, Sorocaba, Sumaré, Tabatinga, Tambaú, Taquaritinga, Tatuí, Taubaté, Tietê, Trabiju, Tremembé, Uchoa, Valinhos, Várzea Paulista, Vinhedo, Votorantim";
            this.state.availableCities = citiesString.split(', ').sort();
            this._getAllPlansFromDOM();
        },

        /**
         * Associa todos os ouvintes de eventos aos elementos do DOM.
         * @private
         */
        _bindEvents() {
            document.body.addEventListener('click', this._handleBodyClick.bind(this));
            if (this.nodes.menuBtn) this.nodes.menuBtn.addEventListener('click', () => this._toggleMobileMenu());
            if (this.nodes.mobileMenuLinks) this.nodes.mobileMenuLinks.forEach(link => link.addEventListener('click', () => this._toggleMobileMenu()));
            if (this.nodes.recommendBtn) this.nodes.recommendBtn.addEventListener('click', () => this._handleRecommendation());
            if (this.nodes.closeCityModalBtn) this.nodes.closeCityModalBtn.addEventListener('click', () => this._closeCityModal());
            if (this.nodes.cityModal) this.nodes.cityModal.addEventListener('click', e => { if (e.target === this.nodes.cityModal) this._closeCityModal(); });
            if (this.nodes.citySearchInput) this.nodes.citySearchInput.addEventListener('input', () => this._filterCities());
            if (this.nodes.cityListContainer) this.nodes.cityListContainer.addEventListener('click', e => this._handleCitySelection(e));
            if (this.nodes.confirmCityBtn) this.nodes.confirmCityBtn.addEventListener('click', () => this._confirmCitySelection());
            if (this.nodes.closeModalBtn) this.nodes.closeModalBtn.addEventListener('click', () => this._closeCheckoutModal());
            if (this.nodes.checkoutModal) this.nodes.checkoutModal.addEventListener('click', e => { if (e.target === this.nodes.checkoutModal) this._closeCheckoutModal(); });
            document.addEventListener('keydown', e => { if (e.key === 'Escape' && !this.nodes.checkoutModal?.classList.contains('hidden')) this._closeCheckoutModal(); });
            if (this.nodes.whatsappForm) this.nodes.whatsappForm.addEventListener('submit', e => this._handleWhatsappSubmit(e));
            if (this.nodes.radioLabels) this.nodes.radioLabels.forEach(label => label.addEventListener('click', e => this._handleRadioChange(e)));
            this._applyInputMask(this.nodes.cpfInput, this._maskCPF);
            this._applyInputMask(this.nodes.telInput, this._maskTel);
            this._applyInputMask(this.nodes.cepInput, this._maskCEP);
            if (this.nodes.cepInput) this.nodes.cepInput.addEventListener('blur', e => this._fetchAddressFromCEP(e.target.value));
            
            // Listener para ajustar o layout do carrossel ao redimensionar a janela
            window.addEventListener('resize', () => this._updateRecommendedPlansLayout());
        },

        /**
         * Inicializa plugins de terceiros, como Flickity e IntersectionObserver.
         * @private
         */
        _initPlugins() {
            if ('IntersectionObserver' in window && this.nodes.fadeInElements?.length) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.1 });
                this.nodes.fadeInElements.forEach(el => observer.observe(el));
            }
            if (this.nodes.promoCarousel && typeof Flickity !== 'undefined') {
                let promoFlickity = null;
                const mediaQuery = window.matchMedia('(max-width: 767px)');

                const handleCarousel = (e) => {
                    // Se a tela for mobile (e o carrossel não foi iniciado)
                    if (e.matches) {
                        if (!promoFlickity) {
                            promoFlickity = new Flickity(this.nodes.promoCarousel, {
                                wrapAround: true,
                                autoPlay: 5000,
                                pageDots: true,
                                cellAlign: 'left',
                                contain: true,
                                imagesLoaded: true
                            });
                        }
                    } else {
                        // Se a tela for desktop (e o carrossel estiver ativo)
                        if (promoFlickity) {
                            promoFlickity.destroy();
                            promoFlickity = null;
                        }
                    }
                };

                // Executa a função na primeira vez que a página carrega
                handleCarousel(mediaQuery);

                // Executa a função toda vez que a largura da tela mudar entre mobile/desktop
                mediaQuery.addEventListener('change', handleCarousel);
            }
        },

        // =======================================================
        // MÉTODOS DE UTILIDADE GERAL E LÓGICA DE NEGÓCIO
        // =======================================================
        _displayUserError(message, errorElement) { if (errorElement) { errorElement.textContent = message; errorElement.classList.remove('hidden'); } },
        _normalizeText: text => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
        _toggleMobileMenu() { if (!this.nodes.menuBtn || !this.nodes.mobileMenu) return; const isExpanded = this.nodes.menuBtn.getAttribute('aria-expanded') === 'true'; this.nodes.menuBtn.setAttribute('aria-expanded', !isExpanded); this.nodes.mobileMenu.classList.toggle('hidden'); this.nodes.menuIconOpen?.classList.toggle('hidden'); this.nodes.menuIconClose?.classList.toggle('hidden'); },
        
        _getAllPlansFromDOM() {
            if (!this.nodes.allPlansStorage?.content) return;
            const planNodes = this.nodes.allPlansStorage.content.querySelectorAll('.plan-card');
            const plans = [];
            planNodes.forEach(node => {
                plans.push({ id: node.id, name: node.querySelector('h3')?.textContent.trim() || 'Plano sem nome', description: node.querySelector('p')?.textContent.trim() || '', price: node.dataset.price, features: Array.from(node.querySelectorAll('ul li')).map(li => li.textContent.trim()) });
            });
            this.state.allPlans = plans;
        },

        async _handleRecommendation() {
            const userInput = this.nodes.needsInput.value.trim();
            if (!userInput) { this._displayUserError("Por favor, descreva sua necessidade para a IA.", this.nodes.recommenderError); return; }
            if (!this.config.geminiApiKey || this.config.geminiApiKey.includes("AIzaSyDB3RFLt-hjYFWhtBKyqgVodWt4LqNoe_w")) { this._displayUserError("API Key do Google não configurada.", this.nodes.recommenderError); console.warn("Chave de API do Gemini não encontrada ou inválida."); return; }
            
            this.nodes.recommenderError?.classList.add('hidden');
            this.nodes.recommendLoader?.classList.remove('hidden');
            if (this.nodes.recommendBtn) this.nodes.recommendBtn.disabled = true;

            const prompt = `Você é um assistente especialista em vendas de planos de internet da empresa Piel Telecom. Sua tarefa é analisar a necessidade de um cliente e recomendar os 3 melhores planos de internet para ele, com base na lista de planos disponíveis. **Necessidade do Cliente:** "${userInput}" **Lista de Planos Disponíveis (formato JSON):** ${JSON.stringify(this.state.allPlans, null, 2)} **Instruções:** 1. Analise a necessidade do cliente e compare com os detalhes de cada plano. 2. Selecione os 3 planos mais adequados. 3. Para cada plano recomendado, escreva uma justificativa curta e amigável (em português do Brasil). 4. Retorne sua resposta estritamente no formato JSON especificado no schema. Não inclua nenhuma outra informação ou texto fora do JSON. 5. IMPORTANTE: Assegure que o JSON de saída seja perfeitamente válido. O campo "reason" deve ser uma string única, sem quebras de linha literais e com aspas duplas devidamente escapadas (\\").`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema: { type: "OBJECT", properties: { "recommendations": { type: "ARRAY", items: { type: "OBJECT", properties: { "planId": { "type": "STRING" }, "reason": { "type": "STRING" } }, required: ["planId", "reason"] } } }, required: ["recommendations"] } } };
            const apiUrl = `${this.config.geminiApiUrl}${this.config.geminiApiKey}`;

            try {
                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!response.ok) { const errorBody = await response.text(); throw new Error(`API Error: ${response.status} - ${errorBody}`); }
                const result = await response.json();
                const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!jsonText) throw new Error("A resposta da IA está vazia ou em formato inesperado.");
                this._renderRecommendations(JSON.parse(jsonText));
            } catch (error) {
                console.error("Falha ao obter recomendação da API Gemini:", error);
                this._displayUserError("Desculpe, a IA não conseguiu gerar uma recomendação. Tente novamente.", this.nodes.recommenderError);
            } finally {
                this.nodes.recommendLoader?.classList.add('hidden');
                if (this.nodes.recommendBtn) this.nodes.recommendBtn.disabled = false;
            }
        },

        /**
         * Renderiza os planos recomendados pela IA na interface e ajusta o layout.
         * @param {object} result - O objeto de resultado da IA.
         * @private
         */
        _renderRecommendations(result) {
            if (!this.nodes.recommendedGrid) return;
            if (this.state.flickityRecommended) { this.state.flickityRecommended.destroy(); this.state.flickityRecommended = null; }
            this.nodes.recommendedGrid.innerHTML = '';
            if (!result.recommendations?.length) { this._displayUserError("Não foram encontradas recomendações adequadas.", this.nodes.recommenderError); return; }

            result.recommendations.forEach(rec => {
                const originalCard = this.nodes.allPlansStorage.content.getElementById(rec.planId);
                if (originalCard) {
                    const clonedCardContainer = document.createElement('div');
                    clonedCardContainer.className = 'carousel-cell w-full md:w-1/2 lg:w-1/3 px-2';
                    const clonedCard = originalCard.cloneNode(true);
                    const reasonContainer = clonedCard.querySelector('.gemini-reason-container');
                    if (reasonContainer) { reasonContainer.innerHTML = `<div class="p-3 mt-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-800 rounded-r-lg"><strong>✨ Recomendação da IA:</strong> ${rec.reason}</div>`; }
                    clonedCardContainer.appendChild(clonedCard);
                    this.nodes.recommendedGrid.appendChild(clonedCardContainer);
                }
            });
            
            this.nodes.allPlansContainer?.classList.add('hidden');
            this.nodes.recommendedContainer?.classList.remove('hidden');
            this._updateRecommendedPlansLayout();
            this.nodes.recommendedContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },

        /**
         * Verifica o tamanho da tela e aplica o layout correto (carrossel ou grid) para os planos recomendados.
         * @private
         */
        _updateRecommendedPlansLayout() {
            if (!this.nodes.recommendedGrid || typeof Flickity === 'undefined') return;
            const isDesktop = window.matchMedia(this.config.desktopBreakpoint).matches;

            this.nodes.recommendedGrid.classList.toggle('lg:flex', isDesktop);
            this.nodes.recommendedGrid.classList.toggle('lg:justify-center', isDesktop);
            this.nodes.recommendedGrid.classList.toggle('lg:gap-4', isDesktop);

            if (isDesktop) {
                if (this.state.flickityRecommended) { this.state.flickityRecommended.destroy(); this.state.flickityRecommended = null; }
            } else {
                if (!this.state.flickityRecommended && this.nodes.recommendedGrid.children.length > 0) {
                    this.state.flickityRecommended = new Flickity(this.nodes.recommendedGrid, { wrapAround: true, pageDots: true, cellAlign: 'left', contain: true, imagesLoaded: true, autoPlay: false, adaptiveHeight: true });
                }
            }
        },
        
        _handleBodyClick(e) { const contratarBtn = e.target.closest('.contratar-btn'); if (contratarBtn) { e.preventDefault(); const card = contratarBtn.closest('.plan-card'); if (card) { this.state.selectedPlanInfo = { plan: card.dataset.plan, price: card.dataset.price }; this._openCityModal(); } } },
        _openCityModal() { if (!this.nodes.cityModal) return; this.nodes.citySearchInput.value = ''; this._renderCityList(this.state.availableCities); if (this.nodes.confirmCityBtn) this.nodes.confirmCityBtn.disabled = true; this.nodes.cityModal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; setTimeout(() => { this.nodes.cityModalPanel?.classList.remove('opacity-0', '-translate-y-4'); this.nodes.citySearchInput.focus(); }, 50); },
        _closeCityModal() { if (!this.nodes.cityModal) return; this.nodes.cityModalPanel?.classList.add('opacity-0', '-translate-y-4'); setTimeout(() => { this.nodes.cityModal.classList.add('hidden'); document.body.style.overflow = 'auto'; }, 300); },
        _openCheckoutModal() { if (!this.nodes.checkoutModal || !this.nodes.whatsappForm) return; this.nodes.selectedPlanNameSpan.textContent = this.state.selectedPlanInfo.plan; this.nodes.whatsappForm.dataset.plan = this.state.selectedPlanInfo.plan; this.nodes.whatsappForm.dataset.price = this.state.selectedPlanInfo.price; this.nodes.whatsappForm.reset(); this._clearFormErrors(); this.nodes.radioLabels.forEach(label => label.classList.remove('is-checked')); this.nodes.whatsappFormContainer.classList.remove('hidden'); this.nodes.whatsappSuccessContainer.classList.add('hidden'); this.nodes.checkoutModal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; this.nodes.checkoutModal.focus(); },
        _closeCheckoutModal() { if (!this.nodes.checkoutModal) return; this.nodes.checkoutModal.classList.add('hidden'); document.body.style.overflow = 'auto'; },
        _renderCityList(cities) { if (!this.nodes.cityListContainer || !this.nodes.cityListError) return; this.nodes.cityListContainer.innerHTML = ''; this.nodes.cityListError.classList.toggle('hidden', cities.length > 0); const fragment = document.createDocumentFragment(); cities.forEach(city => { const cityButton = document.createElement('button'); cityButton.className = 'w-full text-left px-4 py-2 text-gray-700 hover:bg-yellow-50 hover:text-brand-gold transition-colors duration-150 rounded'; cityButton.textContent = city; cityButton.type = 'button'; fragment.appendChild(cityButton); }); this.nodes.cityListContainer.appendChild(fragment); },
        _filterCities() { const searchTerm = this._normalizeText(this.nodes.citySearchInput.value); const filtered = this.state.availableCities.filter(city => this._normalizeText(city).includes(searchTerm)); this._renderCityList(filtered); this._validateCitySelection(); },
        _handleCitySelection(e) { if (e.target.tagName === 'BUTTON') { this.nodes.citySearchInput.value = e.target.textContent; this._filterCities(); if (this.nodes.confirmCityBtn) this.nodes.confirmCityBtn.focus(); } },
        _validateCitySelection() { const currentInput = this._normalizeText(this.nodes.citySearchInput.value); const isValid = this.state.availableCities.some(city => this._normalizeText(city) === currentInput); if (this.nodes.confirmCityBtn) this.nodes.confirmCityBtn.disabled = !isValid; },
        _confirmCitySelection() { this._openCheckoutModal(); this._closeCityModal(); },
        _applyInputMask(input, maskFunction) { if (input) { input.addEventListener('input', (e) => { e.target.value = maskFunction(e.target.value); }); } },
        _maskCPF: value => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'),
        _maskTel: value => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1'),
        _maskCEP: value => value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1'),
        async _fetchAddressFromCEP(cep) { const cleanCep = cep.replace(/\D/g, ''); if (cleanCep.length !== 8) return; try { const response = await fetch(`${this.config.viacepUrl}${cleanCep}/json/`); if (!response.ok) throw new Error('CEP não encontrado'); const address = await response.json(); if (address.erro) throw new Error('CEP inválido'); if (this.nodes.ruaInput) this.nodes.ruaInput.value = address.logradouro || ''; if (this.nodes.bairroInput) this.nodes.bairroInput.value = address.bairro || ''; if (this.nodes.cidadeInput) this.nodes.cidadeInput.value = address.localidade || ''; } catch (error) { console.error("Erro ao buscar CEP:", error); } },
        _validateField(input) { let isValid = input.checkValidity(); const errorContainer = input.nextElementSibling; if (input.name === 'wa-cpf') isValid = isValid && /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(input.value); if (input.name === 'wa-tel1') isValid = isValid && /^\(\d{2}\) \d{5}-\d{4}$/.test(input.value); if (input.name === 'wa-cep') isValid = isValid && /^\d{5}-\d{3}$/.test(input.value); if (errorContainer?.classList.contains('error-message')) { input.classList.toggle('is-invalid', !isValid); errorContainer.textContent = isValid ? '' : (input.validationMessage || 'Campo inválido.'); } return isValid; },
        _clearFormErrors() { if (!this.nodes.whatsappForm) return; this.nodes.whatsappForm.querySelectorAll('.form-input').forEach(input => { input.classList.remove('is-invalid'); const errorEl = input.nextElementSibling; if (errorEl?.classList.contains('error-message')) { errorEl.textContent = ''; } }); if (this.nodes.radioError) this.nodes.radioError.textContent = ''; },
        _handleRadioChange(event) { const currentLabel = event.currentTarget; this.nodes.radioLabels.forEach(label => label.classList.remove('is-checked')); currentLabel.classList.add('is-checked'); if(this.nodes.radioError) this.nodes.radioError.textContent = ''; },
        async _handleWhatsappSubmit(e) { e.preventDefault(); this._clearFormErrors(); let isFormValid = Array.from(this.nodes.whatsappForm.querySelectorAll('input[required]:not([type=radio])')).every(input => this._validateField(input)); const radioChecked = this.nodes.whatsappForm.querySelector('input[name="installation_period"]:checked'); if (!radioChecked) { if(this.nodes.radioError) this.nodes.radioError.textContent = 'Por favor, selecione um período.'; isFormValid = false; } if (!isFormValid) return; const formData = new FormData(this.nodes.whatsappForm); const data = Object.fromEntries(formData.entries()); const { plan, price } = this.nodes.whatsappForm.dataset; const message = `✨ NOVO PEDIDO DE CADASTRO ✨\n-----------------------------------\nPlano Escolhido: *${plan}*\nValor: *${price}*\n-----------------------------------\n🔹 NOME COMPLETO: ${data['wa-nome']}\n🔹 NOME DA MÃE: ${data['wa-mae']}\n🔹 DATA DE NASCIMENTO: ${data['wa-nascimento']}\n🔹 CPF: ${data['wa-cpf']}\n🔹 RG: ${data['wa-rg']}\n📧 E-MAIL: ${data['wa-email']}\n🔹 TELEFONE TITULAR: ${data['wa-tel1']}\n🔹 ENDEREÇO: Rua ${data['wa-rua']}, Nº ${data['wa-numero']}, Bairro ${data['wa-bairro']}, Cidade ${data['wa-cidade']}, CEP ${data['wa-cep']}\n🔹 INSTALAÇÃO: ${data.installation_period}`; if (this.nodes.whatsappSendLink) this.nodes.whatsappSendLink.href = `https://wa.me/${this.config.whatsappNumber}?text=${encodeURIComponent(message)}`; this.nodes.whatsappFormContainer.classList.add('hidden'); this.nodes.whatsappSuccessContainer.classList.remove('hidden'); },
        
        // =======================================================
        // MÓDULO JARVIS - IA DE CONVERSAÇÃO
        // =======================================================
        jarvis: {
    parent: null, nodes: {}, state: { session: null, isOpen: false, },
    init(parent) { this.parent = parent; this._mapDOMNodes(); this._bindEvents(); },
    _mapDOMNodes() { const nodeSelectors = { chatButton: '#jarvis-chat-button', chatContainer: '#jarvis-chat-container', chatLog: '#jarvis-chat-log', userInput: '#jarvis-user-input', sendButton: '#jarvis-send-button', openIcon: '#jarvis-open-icon', closeIcon: '#jarvis-close-icon', }; for (const key in nodeSelectors) { this.nodes[key] = document.querySelector(nodeSelectors[key]); } },
    _bindEvents() { if (this.nodes.chatButton) this.nodes.chatButton.addEventListener('click', () => this.toggleChat()); if (this.nodes.sendButton) this.nodes.sendButton.addEventListener('click', () => this.sendUserMessage()); if (this.nodes.userInput) { this.nodes.userInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendUserMessage(); } }); } },
    toggleChat() { if (!this.nodes.chatContainer) return; this.state.isOpen = this.nodes.chatContainer.classList.toggle('is-open'); this.nodes.openIcon?.classList.toggle('hidden', this.state.isOpen); this.nodes.closeIcon?.classList.toggle('hidden', !this.state.isOpen); if (this.state.isOpen) { this._initSession(); this.nodes.userInput.focus(); } },

    async sendUserMessage() {
        const message = this.nodes.userInput.value.trim();
        if (message === '' || this.nodes.userInput.disabled) return;
        this._addMessageToLog(message, 'user');
        this.nodes.userInput.value = '';
        this._setChatInputDisabled(true);

        // ALTERADO: Envolvemos a chamada principal em um try/finally para garantir que o input seja sempre reabilitado
        try {
            const jarvisResponse = await this._handleMessage(message);
            // NOVO: O modelo pode retornar múltiplas mensagens ou nenhuma.
            if (jarvisResponse && jarvisResponse.trim() !== "") {
                 this._addMessageToLog(jarvisResponse, 'jarvis');
            }
        } catch (error) {
            console.error("Erro no fluxo principal da mensagem:", error);
            this._addMessageToLog("Desculpe, Senhor. Ocorreu um erro interno. Por favor, tente novamente.", 'jarvis');
        } finally {
            this._setChatInputDisabled(false);
        }
    },

    async _handleMessage(message) {
        this.state.session.history.push({ role: "user", parts: [{ text: message }] });
        this._addTypingIndicator();

        let apiResponse;
        try {
            apiResponse = await this._callGeminiAPI(this.state.session.history);
        } finally {
            this._removeTypingIndicator(); // Garante que o "digitando..." suma mesmo se a API falhar.
        }

        if (apiResponse.error) return apiResponse.error;
        if (!apiResponse.candidates?.length) return "Desculpe, não consegui processar sua solicitação.";

        let responsePart = apiResponse.candidates[0].content.parts[0];

        // Loop para lidar com chamadas de função encadeadas
        while (responsePart.functionCall) {
            const functionCall = responsePart.functionCall;
            const functionName = functionCall.name;
            let toolResult = {};

            // NOVO: Bloco try/catch para a execução da ferramenta
            try {
                if (this.knowledge.toolFunctions[functionName]) {
                    console.log(`Calling tool: ${functionName} with args:`, functionCall.args);
                    toolResult = this.knowledge.toolFunctions[functionName](functionCall.args);
                } else {
                    console.error(`Tool function "${functionName}" not found.`);
                    toolResult = { error: `Ferramenta ${functionName} não encontrada.` };
                }
            } catch (error) {
                console.error(`Error executing tool ${functionName}:`, error);
                toolResult = { error: `Ocorreu um erro interno ao usar a ferramenta ${functionName}.` };
            }

            this.state.session.history.push({ role: "model", parts: [{ functionCall }] });
            this.state.session.history.push({ role: "tool", parts: [{ functionResponse: { name: functionName, response: toolResult } }] });

            this._addTypingIndicator();
             try {
                apiResponse = await this._callGeminiAPI(this.state.session.history);
            } finally {
                this._removeTypingIndicator();
            }

            if (!apiResponse.candidates?.length) return "Ocorreu um erro ao processar a resposta da ferramenta.";
            responsePart = apiResponse.candidates[0].content.parts[0];
        }

        const modelResponse = responsePart.text || ""; // Garante que não seja undefined
        if (modelResponse) {
             this.state.session.history.push({ role: "model", parts: [{ text: modelResponse }] });
        }
        return modelResponse;
    },

    async _callGeminiAPI(history) {
        const apiUrl = `${this.parent.config.geminiApiUrl}${this.parent.config.geminiApiKey}`;
        const payload = { contents: history, tools: this.knowledge.tools };
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Gemini API call failed:", error);
            return { error: "Não foi possível conectar à IA. Tente novamente." };
        }
    },

    _initSession() {
        if (!this.state.session) {
            const planosParaPrompt = JSON.stringify(this.knowledge.base.planos, null, 2);
            this.state.session = {
                history: [
                    {
                        role: "user",
                        parts: [{
                            // ALTERADO: O prompt foi reescrito para ser mais direto e proativo.
                            text: `System instruction:
Você é Jarvis, um assistente de IA da Piel Telecom. Seu objetivo é qualificar leads e fechar vendas de forma consultiva e autônoma.

**Persona:**
Seja sempre extremamente educado, proativo, sofisticado e preciso, como um mordomo tecnológico. Trate o cliente por "Senhor". Sua comunicação deve ser clara e inspirar confiança. Você NUNCA deve sair do seu personagem.

**Diretriz Principal de Conversação:**
Sua principal missão é **CONDUZIR ATIVAMENTE** a conversa. Após cada resposta do cliente, você deve **IMEDIATAMENTE** e **SEM HESITAR** dar o próximo passo lógico no fluxo. Não espere por um "ok" ou qualquer outra confirmação do cliente para avançar. Seja o guia.

**Fluxo de Conversa OBRIGATÓRIO:**
1.  **Saudação e Análise:** Apresente-se e pergunte qual a principal necessidade do cliente com a internet (Ex: "O senhor usará para trabalho, para jogos, para a família toda assistir a filmes, ou um uso mais geral?").
2.  **Recomendação:** Com base na resposta, use a ferramenta \`get_plan_details\` para encontrar o plano ideal e o recomende, explicando o porquê com base no perfil e usando o argumento de venda.
3.  **Confirmação e Início da Coleta:** Se o cliente demonstrar interesse (ex: "gostei", "pode ser", "ok"), **imediatamente** inicie a coleta de dados para o cadastro. **PEÇA UMA INFORMAÇÃO POR VEZ**, em sequência.
4.  **Coleta e Validação Imediata:**
    - Peça o Nome Completo.
    - Peça o Nome da Mãe.
    - Peça a Data de Nascimento (DD/MM/AAAA).
    - Peça o CPF. **Assim que receber, use a ferramenta \`validate_cpf\` e reaja ao resultado.**
    - Peça o RG. **Assim que receber, use a ferramenta \`validate_rg\` e reaja ao resultado.**
    - Peça o E-mail.
    - Peça a Cidade. **Assim que receber, use a ferramenta \`check_address_coverage\` e reaja ao resultado.**
    - Se houver cobertura, peça o restante do endereço (Rua, Número, Bairro, CEP).
    - Peça o melhor período para instalação (Manhã/Tarde).
5.  **Finalização:** Após ter **TODOS** os dados, você **DEVE** chamar a ferramenta \`start_customer_registration\` com todas as informações coletadas. Em seguida, informe ao cliente que o cadastro foi iniciado e que um consultor humano entrará em contato para finalizar.

**Regras Críticas:**
-   **NUNCA** invente planos ou preços. Use **APENAS** a ferramenta \`get_plan_details\`.
-   Se um dado for inválido (CPF/RG), informe educadamente e peça para que o cliente verifique e envie novamente.
-   Se a cidade não tiver cobertura, informe o fato e agradeça o contato. Encerre a conversa educadamente.
-   Base de Conhecimento de Planos (para consulta via ferramenta): ${planosParaPrompt}`
                        }]
                    },
                    { role: "model", parts: [{ text: "Olá, Senhor. Eu sou o Jarvis, assistente virtual da Piel Telecom. Para que eu possa recomendar o plano de fibra óptica ideal, poderia me dizer qual será o principal uso da sua internet?" }] }
                ]
            };
            this._addMessageToLog(this.state.session.history[1].parts[0].text, 'jarvis');
        }
    },
    
    _addMessageToLog(message, sender) { if (!this.nodes.chatLog) return; const messageContainer = document.createElement('div'); messageContainer.className = sender === 'user' ? 'user-message' : 'jarvis-message'; const bubble = document.createElement('div'); bubble.className = 'message-bubble'; bubble.innerHTML = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'); messageContainer.appendChild(bubble); this.nodes.chatLog.appendChild(messageContainer); this.nodes.chatLog.scrollTop = this.nodes.chatLog.scrollHeight; },
    _addTypingIndicator() { if(document.getElementById('typing-indicator-bubble')) return; const indicator = document.createElement('div'); indicator.id = 'typing-indicator-bubble'; indicator.className = 'jarvis-message'; indicator.innerHTML = `<div class="message-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`; this.nodes.chatLog.appendChild(indicator); this.nodes.chatLog.scrollTop = this.nodes.chatLog.scrollHeight; },
    _removeTypingIndicator() { document.getElementById('typing-indicator-bubble')?.remove(); },
    _setChatInputDisabled(isDisabled) { if (this.nodes.userInput) this.nodes.userInput.disabled = isDisabled; if (this.nodes.sendButton) this.nodes.sendButton.disabled = isDisabled; if (!isDisabled) this.nodes.userInput.focus(); },
    
    knowledge: {
        base: {
            planos: { "Fibra Home 200M+": { preco: "R$79,99", download: "200 Mbps", upload: "100 Mbps", perfil: "Ideal para clientes com orçamento limitado, que moram sozinhos ou em casal, e têm um uso básico da internet (redes sociais, vídeos em HD, e-mails).", argumento: "Este plano é focado no essencial, com uma ótima taxa de upload para essa faixa de preço." }, "Fibra Home 400M+": { preco: "R$94,99", download: "400 Mbps", upload: "200 Mbps", perfil: "Atende bem uma família, garantindo que todos possam assistir vídeos e navegar sem travar. Essencial para home office com videochamadas.", argumento: "Para quem trabalha em casa, a velocidade de envio de arquivos é crucial. Este plano já oferece 200 Mega de upload, o que deixa suas videochamadas com ótima qualidade." }, "Fibra Home 600M+": { preco: "R$99,99", download: "600 Mbps", upload: "300 Mbps", perfil: "Melhor custo-benefício de entrada. Garante que mesmo com todos conectados ao mesmo tempo, a qualidade continue perfeita.", argumento: "Por apenas R$ 5 a mais que o plano de 400M, o senhor leva 200 Mega a mais de download. É um salto de performance muito grande por uma diferença mínima." }, "Fibra Home 600M+ Max": { preco: "R$119,99", download: "600 Mbps", upload: "300 Mbps", perfil: "Mesma velocidade do 600M+ padrão, mas com hardware superior (ex: roteador Wi-Fi 6) para melhor cobertura e desempenho.", argumento: "Este plano inclui um roteador superior para garantir que o sinal de Wi-Fi chegue com força total em mais ambientes da casa." }, "Fibra Home 1G+": { preco: "R$119,99", download: "1 Gbps", upload: "500 Mbps", perfil: "Melhor custo-benefício de alta velocidade. Para clientes que buscam a máxima performance para downloads rápidos de jogos e arquivos.", argumento: "Se o foco é ter a velocidade bruta para baixar jogos e arquivos rapidamente, este plano de 1 Giga entrega uma experiência fantástica por um preço excelente." }, "Fibra Home 1G+ Gamer": { preco: "R$169,99", download: "1 Gbps", upload: "500 Mbps", perfil: "Plano desenhado para gamers, com rotas otimizadas para servidores de jogos, garantindo baixa latência (ping).", argumento: "Se o senhor joga online, sabe que o ping baixo é tudo. Este plano é desenhado para isso, com rotas otimizadas para os servidores dos principais jogos e 500 Mega de upload para suas lives." }, "Fibra Home 1G+ Home Office": { preco: "R$169,99", download: "1 Gbps", upload: "500 Mbps", perfil: "Otimizado para as principais ferramentas de trabalho, garantindo estabilidade em reuniões importantes.", argumento: "Este plano foi pensado para o profissional. Além da velocidade máxima, ele tem otimização para as principais ferramentas de trabalho, garantindo que sua internet não falhe em uma reunião importante." }, "Fibra Home 1G+ Black": { preco: "R$199,99", download: "1 Gbps", upload: "500 Mbps", perfil: "Para heavy users e casas conectadas, vem com equipamentos premium (Wi-Fi 6/6E, talvez rede Mesh) para cobertura total.", argumento: "Para quem precisa não só de velocidade, mas de um sinal que cubra a casa toda com qualidade, o plano Black vem com equipamentos premium para garantir que todos os seus dispositivos funcionem perfeitamente." }, "Fibra Home 1G+ Black c/ Disney+": { preco: "R$239,99", download: "1 Gbps", upload: "500 Mbps", perfil: "O pacote completo: internet mais rápida, equipamentos premium e assinatura do Disney+ inclusa.", argumento: "Para a família que quer o pacote completo: a internet mais rápida possível e já com o Disney+ incluso, tudo numa fatura só." }, "Fibra Home Socio Ponte Preta ou Guarani": { preco: "Preço Especial", download: "800 Mbps", upload: "400 Mbps", perfil: "Plano exclusivo para sócios torcedores com velocidade e preço especiais.", argumento: "Se o senhor é torcedor de coração, temos um plano exclusivo que, além de ter uma super velocidade, ainda ajuda o seu time." }, "Fibra Home 600M+ Movel 10G ou 15G": { preco: "Consultar", download: "600 Mbps", upload: "300 Mbps", perfil: "Combo de internet residencial com plano de celular, unificando as contas.", argumento: "Com nosso combo, o senhor leva uma internet de 600 Mega para casa e ainda um plano de celular. Fica tudo em uma conta só e muitas vezes sai mais barato." } },
            cidadesComCobertura: new Set(['aguaí', 'aguai', 'águas de santa bárbara', 'aguas de santa barbara', 'agudos', 'alumínio', 'aluminio', 'americana', 'américo brasiliense', 'americo brasiliense', 'amparo', 'angatuba', 'araçariguama', 'aracariguama', 'araçoiaba da serra', 'aracoiaba da serra', 'arandu', 'araraquara', 'araras', 'arealva', 'areiópolis', 'areiopolis', 'artur nogueira', 'atibaia', 'avaí', 'avai', 'avaré', 'avare', 'bady bassitt', 'barra bonita', 'barretos', 'bauru', 'bebedouro', 'biritiba-mirim', 'boa esperança do sul', 'boa esperanca do sul', 'bocaina', 'bofete', 'boituva', 'bom jesus dos perdões', 'bom jesus dos perdoes', 'borborema', 'borebi', 'botucatu', 'bragança paulista', 'braganca paulista', 'cabreúva', 'cabreuva', 'caçapava', 'cacapava', 'cafelândia', 'cafelandia', 'caieiras', 'campina do monte alegre', 'campinas', 'campo limpo paulista', 'cândido rodrigues', 'candido rodrigues', 'capela do alto', 'capivari', 'casa branca', 'cedral', 'cerqueira césar', 'cerqueira cesar', 'cerquilho', 'cesário lange', 'cesario lange', 'colina', 'conchal', 'conchas', 'cordeirópolis', 'cordeiropolis', 'cosmópolis', 'cosmopolis', 'cravinhos', 'cristais paulista', 'cubatão', 'cubatao', 'descalvado', 'dobrada', 'dois córregos', 'dois corregos', 'dourado', 'elias fausto', 'engenheiro coelho', 'estiva gerbi', 'fernando prestes', 'franca', 'francisco morato', 'franco da rocha', 'gavião peixoto', 'gaviao peixoto', 'guaíra', 'guaira', 'guapiaçu', 'guapiacu', 'guarantã', 'guaranta', 'guararema', 'guariba', 'guarujá', 'guaruja', 'guatapará', 'guatapara', 'holambra', 'hortolândia', 'hortolandia', 'iaras', 'ibaté', 'ibate', 'ibitinga', 'igaraçu do tietê', 'igaracu do tiete', 'igaratá', 'igarata', 'indaiatuba', 'iperó', 'ipero', 'iracemápolis', 'iracemapolis', 'itaí', 'itai', 'itajobi', 'itaju', 'itanhaém', 'itanhaem', 'itapetininga', 'itápolis', 'itapolis', 'itapuí', 'itapui', 'itatinga', 'itirapuã', 'itirapua', 'itu', 'itupeva', 'jaborandi', 'jaboticabal', 'jacareí', 'jacarei', 'jaguariúna', 'jaguariuna', 'jarinu', 'jaú', 'jau', 'jumirim', 'jundiaí', 'jundiai', 'laranjal paulista', 'leme', 'lençóis paulista', 'lencois paulista', 'limeira', 'lindóia', 'lindoia', 'lins', 'louveira', 'macatuba', 'mairiporã', 'mairipora', 'manduri', 'matão', 'matao', 'mineiros do tietê', 'mineiros do tiete', 'mirassol', 'mogi das cruzes', 'mogi guaçu', 'mogi guacu', 'mogi mirim', 'mongaguá', 'mongagua', 'monte alegre do sul', 'monte alto', 'monte mor', 'motuca', 'nazaré paulista', 'nazare paulista', 'nova europa', 'nova odessa', 'óleo', 'oleo', 'olímpia', 'olimpia', 'paranapanema', 'pardinho', 'patrocínio paulista', 'patrocinio paulista', 'paulínia', 'paulinia', 'pederneiras', 'pedreira', 'pereiras', 'peruíbe', 'peruibe', 'pilar do sul', 'pindorama', 'piracaia', 'piracicaba', 'pirajuí', 'pirajui', 'pirassununga', 'piratininga', 'pitangueiras', 'porangaba', 'porto ferreira', 'praia grande', 'pratânia', 'pratania', 'presidente alves', 'quadra', 'rafard', 'ribeirão bonito', 'ribeirao bonito', 'ribeirão corrente', 'ribeirao corrente', 'ribeirão preto', 'ribeirao preto', 'rincão', 'rincao', 'rio claro', 'rio das pedras', 'salesópolis', 'salesopolis', 'saltinho', 'salto de pirapora', 'santa adélia', 'santa adelia', 'santa bárbara d’oeste', 'santa barbara d’oeste', 'santa branca', 'santa cruz das palmeiras', 'santa ernestina', 'santa gertrudes', 'santa lúcia', 'santa lucia', 'santa rita do passa quatro', 'santa rosa de viterbo', 'santo antônio de posse', 'santo antonio de posse', 'santos', 'são bernardo do campo', 'sao bernardo do campo', 'são carlos', 'sao carlos', 'são josé do rio preto', 'sao jose do rio preto', 'são josé dos campos', 'sao jose dos campos', 'são manuel', 'sao manuel', 'são vicente', 'sao vicente', 'sarapuí', 'sarapui', 'serra azul', 'serra negra', 'sorocaba', 'sumaré', 'sumare', 'tabatinga', 'tambaú', 'tambau', 'taquaritinga', 'tatuí', 'tatui', 'taubaté', 'taubate', 'tietê', 'tiete', 'trabiju', 'tremembé', 'tremembe', 'uchoa', 'valinhos', 'várzea paulista', 'varzea paulista', 'vinhedo', 'votorantim'])
        },
        tools: [{
            functionDeclarations: [
                { name: "start_customer_registration", description: "Inicia o processo de cadastro do cliente após ele ter fornecido todos os dados necessários e confirmado o plano.", parameters: { type: "OBJECT", properties: { plano: { type: "STRING" }, nome_completo: { type: "STRING" }, nome_mae: { type: "STRING" }, data_nascimento: { type: "STRING" }, cpf: { type: "STRING" }, rg: { type: "STRING" }, email: { type: "STRING" }, rua_numero: { type: "STRING" }, bairro: { type: "STRING" }, cidade: { type: "STRING" }, cep: { type: "STRING" }, periodo_instalacao: { type: "STRING" } }, required: ["plano", "nome_completo", "nome_mae", "data_nascimento", "cpf", "rg", "email", "rua_numero", "bairro", "cidade", "cep", "periodo_instalacao"] } },
                { name: "validate_cpf", description: "Valida um número de CPF para verificar se é um documento matematicamente válido.", parameters: { type: "OBJECT", properties: { cpf: { type: "STRING" } }, required: ["cpf"] } },
                // NOVO: Declaração da ferramenta de validação de RG
                { name: "validate_rg", description: "Valida um número de RG para verificar se tem um formato plausível.", parameters: { type: "OBJECT", properties: { rg: { type: "STRING" } }, required: ["rg"] } },
                { name: "check_address_coverage", description: "Verifica se a cidade informada pelo cliente possui cobertura da Piel Telecom.", parameters: { type: "OBJECT", properties: { cidade: { type: "STRING" } }, required: ["cidade"] } },
                { name: "get_plan_details", description: "Busca e retorna os detalhes de um plano de internet específico, como preço, velocidades e perfil de uso.", parameters: { type: "OBJECT", properties: { nome_do_plano: { type: "STRING", description: "O nome do plano a ser consultado, ex: 'Fibra Home 600M+'" } }, required: ["nome_do_plano"] } }
            ]
        }],
        toolFunctions: {
            validate_cpf: ({ cpf }) => { cpf = cpf.replace(/[^\d]+/g, ''); if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return { "isValid": false }; let sum = 0, remainder; for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i); remainder = (sum * 10) % 11; if ((remainder === 10) || (remainder === 11)) remainder = 0; if (remainder !== parseInt(cpf.substring(9, 10))) return { "isValid": false }; sum = 0; for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i); remainder = (sum * 10) % 11; if ((remainder === 10) || (remainder === 11)) remainder = 0; if (remainder !== parseInt(cpf.substring(10, 11))) return { "isValid": false }; return { "isValid": true }; },
            // NOVO: Implementação da função de validação de RG (pode ser ajustada para regras mais complexas se necessário)
            validate_rg: ({ rg }) => {
                const cleanedRg = typeof rg === 'string' ? rg.replace(/[^\dX]+/gi, '') : '';
                // Validação simples: verifica se o RG tem entre 7 e 10 caracteres (comuns em SP)
                return { isValid: cleanedRg.length >= 7 && cleanedRg.length <= 10 };
            },
            check_address_coverage: ({ cidade }) => ({ hasCoverage: this.knowledge.base.cidadesComCobertura.has(this.parent._normalizeText(cidade)) }),
            get_plan_details: ({ nome_do_plano }) => { let plan = null; const searchKey = Object.keys(this.knowledge.base.planos).find(key => key.toLowerCase().includes(nome_do_plano.toLowerCase())); if (searchKey) { plan = this.knowledge.base.planos[searchKey]; } if (plan) { return { success: true, details: plan }; } return { success: false, message: "Plano não encontrado." }; },
            start_customer_registration: (data) => { console.log("REGISTRATION DATA TO BE SENT TO CRM:", data); return { success: true, message: "Cadastro recebido. Um consultor humano irá revisar e confirmar os detalhes." }; }
        }
    }
},
    }
    // Inicia a aplicação.
    App.init();
});