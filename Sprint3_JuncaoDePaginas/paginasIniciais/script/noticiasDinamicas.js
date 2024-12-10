// Configuração para consumir a API
const API_KEY = 'e29949184b5f463aabefc1ecafd13681'; // Substitua pela sua chave da News API
const API_URL = `https://newsapi.org/v2/everything?q=diabetes&language=pt&apiKey=${API_KEY}`;
const newsContainer = document.getElementById('news-cards');
const articleContainer = document.getElementById('article-card');

async function fetchNews() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.articles && data.articles.length > 0) {
            renderNews(data.articles);
        } else {
            newsContainer.innerHTML = '<p>Nenhuma notícia encontrada no momento.</p>';
        }
    } catch (error) {
        console.error('Erro ao buscar as notícias:', error);
        newsContainer.innerHTML = '<p>Erro ao carregar notícias.</p>';
    }
}

function renderNews(articles) {
    newsContainer.innerHTML = ''; // Limpa o conteúdo atual

    articles.slice(21, 28).forEach((article, index) => {
        if (index === 0) {
            const publishedDate = new Date(article.publishedAt).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        
            const card = document.createElement('div');
            card.className = 'col-12';
        
            card.innerHTML = `
                <div class="card text-center">
                    <div class="card-body">
                        <h4 class="card-title">${truncateText(article.title, 100)}</h4>
                        <p class="card-text">${truncateText(article.description, 300)}</p>
                        <a href="${article.url}" class="btn btn-secondary btn-sm px-5 opacity-75">Leia mais</a>
                    </div>
                    <div class="card-footer text-body-secondary">Publicado em: ${publishedDate}</div>
                </div>
            `;
        
            articleContainer.appendChild(card);
        }
        

        else {
            const card = document.createElement('div');
            card.className = 'col-12 col-sm-6 col-md-4 mb-4';

            card.innerHTML = `
            <div class="card">
                <img src="${article.urlToImage || 'images/default-news.jpg'}" class="card-img-top" alt="Notícia" style="height:200px; object-fit:cover;">
                <div class="card-body">
                    <h5 class="card-title">${truncateText(article.title, 50)}</h5>
                    <p class="card-text">${truncateText(article.description, 120)}</p>
                    <a href="${article.url}" target="_blank" class="btn btn-primary">Leia mais</a>
                </div>
            </div>
        `;

            newsContainer.appendChild(card);
        }
    });
}
function truncateText(text, maxLength) {
    if (text && text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text || 'Texto não disponível.';
}

document.addEventListener("DOMContentLoaded", fetchNews);

function truncateText(text, maxLength) {
    if (text && text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text || 'Texto não disponível.';
}
// Chama a função para buscar notícias quando a página carrega
document.addEventListener("DOMContentLoaded", fetchNews);

// {Js fora da API}
function fecharmodal() {
    // Obter a instância do modal
    const modalElement = document.getElementById('exampleModal');
    const modal = bootstrap.Modal.getInstance(modalElement); // Pega a instância ativa do modal
    if (modal) {
        modal.hide(); // Fecha o modal
    }
    var toast = new bootstrap.Toast(document.getElementById('toastRequestAlert'));
    toast.show();
}
let userRole = ''; // Variável para armazenar a role selecionada

// Função para definir a role
function setRole(role) {
    userRole = role; // Atribui a role do botão clicado
}

// Listener para o envio do formulário
document.getElementById('requestForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Impede o envio padrão do formulário

    const username = document.getElementById('offcanvasUsername').value;
    const comment = document.getElementById('offcanvasComment').value;

    // Verifique se o campo de username e comentário estão preenchidos
    if (!username || !comment) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Verifique se o username já existe no sistema
    fetch(`http://localhost:3000/requisicoes?username=${username}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                // Se já existe uma requisição com esse username, avise o usuário
                alert('Este username já está em uso. Escolha outro.');
            } else {
                // Se não houver requisição com esse username, envie o formulário
                const requestData = {
                    username: username,
                    comment: comment,
                    status: 'pendente', 
                    role: userRole
                };

                fetch('http://localhost:3000/requisicoes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                })
                .then(response => response.json())
                .then(data => {
                    alert('Requisição enviada com sucesso!');
                    document.getElementById('offcanvasUsername').value = '';
                    document.getElementById('offcanvasComment').value = '';
                    // Fechar o offcanvas
                    const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasRequest'));
                    offcanvas.hide();
                })
                .catch(error => {
                    console.error('Erro ao enviar a requisição:', error);
                    alert('Erro ao enviar a requisição.');
                });
            }
        })
        .catch(error => {
            console.error('Erro ao verificar se o username já existe:', error);
            alert('Erro ao verificar o username.');
        });
});

// Função para verificar o status da requisição
document.getElementById('checkRequestStatusButton').addEventListener('click', function() {
    const username = document.getElementById('offcanvasUsername').value;

    // Verifique se o campo de usuário foi preenchido
    if (username) {
        fetch(`http://localhost:3000/requisicoes?username=${username}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const request = data[0]; // Supondo que a requisição será a primeira encontrada

                    // Atualiza os campos do modal com os dados da requisição
                    document.getElementById("modalCardHeader").textContent = `Requisição de: ${request.username}`;
                    document.getElementById("modalUsername").textContent = request.username;
                    document.getElementById("modalComment").textContent = request.comment;
                    document.getElementById("modalStatus").textContent = request.status;
                    document.getElementById("modalRole").textContent = request.role;

                    // Atualiza a cor do status com base no valor
                    const statusElement = document.getElementById("modalStatus");
                    if (request.status === 'aceita') {
                        statusElement.style.color = 'green'; // Cor verde para 'aceita'
                    } else if (request.status === 'pendente') {
                        statusElement.style.color = 'yellow'; // Cor amarela para 'pendente'
                    } else if (request.status === 'recusada') {
                        statusElement.style.color = 'red'; // Cor vermelha para 'recusada'
                    }

                    // Limpa o conteúdo de botão anterior (se houver)
                    const existingRedirectButton = document.getElementById("redirectButton");
                    if (existingRedirectButton) {
                        existingRedirectButton.remove();
                    }

                    // Verifica se o status é 'aceita' e adiciona o botão de redirecionamento
                    const modalBody = document.getElementById("modalBodyReq");

                    console.log('Status da requisição:', request.status);
                    if (request.status === 'aceita') {
                        console.log("Status é 'aceita', entrando no if.");

                        const button = document.createElement("button");
                        button.id = "redirectButton"; // Definindo o ID do botão
                        button.classList.add("btn"); // Adicionando a classe de botão
                        button.textContent = "Ir para Página de ";

                        // Verifica a função do usuário e define o botão correspondente
                        if (request.role === 'Administrador') {
                            console.log("Função é 'Administrador', criando botão para admin.");
                            button.classList.add("btn-info"); 
                            button.textContent += "Administração"; 
                            button.onclick = function() {
                                window.location.href = '../InterfaceAdm/Adm.html';
                            };
                        } else {
                            console.log("Função não é 'Administrador', criando botão para usuário.");
                            button.classList.add("btn-info"); 
                            button.textContent += "Usuário"; 
                            button.onclick = function() {
                                window.location.href = '../perfilMedico/PerfilMed.html';
                            };
                        }

                        // Adiciona o botão ao modal
                        modalBody.appendChild(button);
                    } else {
                        console.log("Status não é 'aceita'.");
                    }

                    // Exibe o modal após atualizar o conteúdo
                    const requestModal = new bootstrap.Modal(document.getElementById('viewRequestModal'));
                    requestModal.show();

                } else {
                    // Caso contrário, informa que a requisição não foi encontrada
                    alert('Nenhuma requisição encontrada para esse usuário.');
                }
            })
            .catch(error => {
                console.error('Erro ao verificar o status da requisição:', error);
                alert('Erro ao verificar o status da requisição.');
            });
    } else {
        alert('Por favor, preencha o campo de usuário para verificar o status.');
    }
});








