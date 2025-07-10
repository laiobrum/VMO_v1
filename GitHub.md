1. Criar o repositório no meu perfil do GitHub
2. Ir para a pasta que quero usar
3. CRIAR O .gitignore - ex.: node_modules *.txt (todos os arquivos com extensão txt), #comments
4. Apagar qualquer arquivo git que possa haver: ---git rm----
5. Iniciar o repositório git no meu ambiente local: ----git init---
6. Adicionar todos/ou algum arquivos para a staging area --------git add .------|ou|------git add nomeArquivo.txt--------
7. Fazer o commit (mandar para o repositório local): --------git commit -m "first commit"--------
8. Colocar no branch main: --------git branch -M main-------------
9. Criar meu repositório online no site mesmo, para abaixo colocar o link
10. Adicionar meu repositório online: ------git remote add origin https://github.com/laiobrum/pensamentos_node.git------
11. Enviar para o repositório online: ---------git push -u origin main--------->> na 1ª vez, o '-u' faz com que a branch seja rastreada, assim posso usar só 'git push' que ele já vai saber a branch que está
12. Vê o status do que foi comitado ou não: -----git status-----

ATUALIZAR COM OS ARQUIVOS NOVOS FEITOS: 
git status ---vê o status de atualizações
git add . ---adiciona todas as alterações para o próximo commit
git commit -m "Atualização do projeto" ---cria commit local com as mudanças '-m' quer dizer mensagem
git push ---|ou|--- git push origin main ---|ou|--- git push -u origin main (se for a primeira vez)---empurra para repositório online

CRIAR NOVA BRANCH NO PC DO TRABALHO:
1. gh auth login ---faz o login no repositório 
2. git clone https://github.com/seu-usuario/seu-repositorio.git ---clona o repositório
3. cd seu-repositorio
4. git checkout -b nome-da-nova-branch ---cria nova branch
5. git add . ---adiciona tudo
6. git commit -m "minhas alterações"
7. git push ---|ou|--- git push origin nome-da-nova-branch ---|ou|--- git push -u origin main (se for a primeira vez)

BAIXAR NOVA BRANCH NO MEU PC PESSOAL:
1. git fetch origin ---baixa tudo que tem no repositório (inclusive nova branch)
2. git branch -r ---vê todas as branches
3. git checkout nome-da-branch ---muda para a nova branch

MERGE DE BRANCHES:
git checkout main ---vai para a main branch
git pull origin main ---garante que a main está atualizada
git merge nome-da-branch ---transforma outra branch em main branch

PARA MAIS COMANDOS, VER NO meu docs: https://docs.google.com/document/d/1WH8Kcaj3vTJB5HqaDr6jbtN7VKhepcnP_gBCQWggFVo/edit?tab=t.0 