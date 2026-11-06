
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Produto, ProdutoService } from '../services/produto.service';

@Component({
  selector: 'app-gerenciamento-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gerenciamento-produtos.component.html',
  styleUrl: './gerenciamento-produtos.component.css'
})
export class GerenciamentoProdutosComponent implements OnInit {

  // Armazena os produtos e os dados utilizados no formulário.
  produtos: Produto[] = [];

  idCategoria: number | null = null;
  nomeProduto = '';
  descricaoProduto = '';
  precoItem: number | null = null;
  codigoPreco = '';
  precoVenda: number | null = null;
  unidade = '';
  ativoProdutoServico = 'S';

  idBusca: number | null = null;
  idEdicao: number | null = null;

  mensagem = '';
  erro = '';
  carregando = false;

  constructor(private produtoService: ProdutoService) {}

  // Executa quando a página é inicializada.
  ngOnInit(): void {
    this.listarProdutos();
  }

  // Busca os produtos cadastrados na API.
  listarProdutos(): void {
    this.carregando = true;

    this.produtoService.listarProdutos().subscribe({
      next: (dados) => {
        // Filtra somente os itens do tipo P (produtos).
        this.produtos = dados.filter(
          produto =>
            String(produto.tipoItem).trim().toUpperCase() === 'P'
        );
        this.carregando = false;
      },
      error: (erro: unknown) => {
        console.error(erro);
        this.erro = 'Não foi possível carregar os produtos.';
        this.carregando = false;
      }
    });
  }

  // Valida os campos e realiza o cadastro ou a edição do produto.
  salvarProduto(): void {
    this.mensagem = '';
    this.erro = '';

    // Verifica se todos os campos obrigatórios foram preenchidos.
    if (
      !this.nomeProduto.trim() ||
      !this.descricaoProduto.trim() ||
      this.idCategoria === null ||
      this.precoItem === null ||
      this.precoVenda === null ||
      !this.codigoPreco.trim() ||
      !this.unidade.trim()
    ) {
      this.erro = 'Preencha todos os campos obrigatórios.';
      return;
    }

    // Impede o cadastro de preços negativos.
    if (this.precoItem < 0 || this.precoVenda < 0) {
      this.erro = 'Os preços não podem ser negativos.';
      return;
    }

    // Monta o objeto com os dados que serão enviados para a API.
    const dados: Partial<Produto> = {
      idcategoria: this.idCategoria,
      item: this.nomeProduto.trim(),
      descricaoItem: this.descricaoProduto.trim(),
      precoItem: this.precoItem,
      tipoItem: 'P',
      ativoProdutoServico: this.ativoProdutoServico,
      codigoPreco: this.codigoPreco.trim(),
      precoVenda: this.precoVenda,
      unidade: this.unidade.trim()
    };

    // Se existir um ID de edição, atualiza o produto.
    if (this.idEdicao !== null) {
      const id = this.idEdicao;

      this.produtoService.editarProduto(id, dados).subscribe({
        next: () => {
          this.mensagem = 'Produto atualizado com sucesso!';
          this.cancelarEdicao();
          this.listarProdutos();
        },
        error: (erro: unknown) => {
          console.error(erro);
          this.erro = 'Não foi possível atualizar o produto.';
        }
      });
    } else {
      // Caso contrário, cadastra um novo produto.
      this.produtoService.cadastrarProduto(dados).subscribe({
        next: () => {
          this.mensagem = 'Produto cadastrado com sucesso!';
          this.limparFormulario();
          this.listarProdutos();
        },
        error: (erro: unknown) => {
          console.error(erro);
          this.erro = 'Não foi possível cadastrar o produto. Confira a categoria informada.';
        }
      });
    }
  }

  // Consulta um produto pelo ID informado.
  consultarPorId(): void {
    this.mensagem = '';
    this.erro = '';

    if (this.idBusca === null) {
      this.erro = 'Informe o ID do produto.';
      return;
    }

    this.produtoService.consultarProduto(this.idBusca).subscribe({
      next: (produto) => {
        // Verifica se o item encontrado realmente é um produto.
        if (String(produto.tipoItem).trim().toUpperCase() !== 'P') {
          this.erro = 'O ID informado não corresponde a um produto.';
          return;
        }

        this.produtos = [produto];
        this.mensagem = 'Produto encontrado.';
      },
      error: (erro: unknown) => {
        console.error(erro);
        this.erro = 'Produto não encontrado.';
      }
    });
  }

  // Carrega os dados do produto selecionado nos campos de edição.
  editar(produto: Produto): void {
    this.idEdicao = produto.idItem;
    this.idCategoria = produto.idcategoria;
    this.nomeProduto = produto.item;
    this.descricaoProduto = produto.descricaoItem;
    this.precoItem = produto.precoItem;
    this.codigoPreco = produto.codigoPreco;
    this.precoVenda = produto.precoVenda;
    this.unidade = produto.unidade;
    this.ativoProdutoServico = produto.ativoProdutoServico;

    this.mensagem = '';
    this.erro = '';
  }

  // Desativa um produto após a confirmação do usuário.
  desativar(id: number): void {
    if (!confirm('Deseja realmente desativar este produto?')) {
      return;
    }

    this.mensagem = '';
    this.erro = '';

    this.produtoService.desativarProduto(id).subscribe({
      next: () => {
        this.mensagem = 'Produto desativado com sucesso!';
        this.listarProdutos();
      },
      error: (erro: unknown) => {
        console.error(erro);
        this.erro = 'Não foi possível desativar o produto.';
      }
    });
  }

  // Cancela a edição e limpa os campos do formulário.
  cancelarEdicao(): void {
    this.idEdicao = null;
    this.limparFormulario();
  }

  // Restaura os campos do formulário para os valores iniciais.
  limparFormulario(): void {
    this.idCategoria = null;
    this.nomeProduto = '';
    this.descricaoProduto = '';
    this.precoItem = null;
    this.codigoPreco = '';
    this.precoVenda = null;
    this.unidade = '';
    this.ativoProdutoServico = 'S';
    this.idEdicao = null;
  }

  // Limpa a pesquisa e retorna à listagem completa.
  voltarLista(): void {
    this.idBusca = null;
    this.mensagem = '';
    this.erro = '';
    this.listarProdutos();
  }
}