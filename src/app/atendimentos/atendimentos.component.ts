import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-atendimentos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './atendimentos.component.html',
  styleUrl: './atendimentos.component.css'
})
export class AtendimentosComponent implements OnInit {
  atendimentos: any[] = [];
  mensagem = '';
  busca = 0;
  cliente = 0;
  data = '';
  item = 0;
  funcionario = 0;
  quantidade = 1;
  valor = 0;

  private url = 'http://localhost:5206/api/Atendimento';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.http.get<any[]>(this.url).subscribe({
      next: dados => this.atendimentos = dados,
      error: () => this.mensagem = 'Não foi possível listar atendimentos.'
    });
  }

  consultar(): void {
    if (this.busca < 1) {
      this.mensagem = 'Informe um ID válido.';
      return;
    }

    this.http.get<any>(`${this.url}/${this.busca}`).subscribe({
      next: atendimento => this.atendimentos = [atendimento],
      error: () => this.mensagem = 'Atendimento não encontrado.'
    });
  }

  salvar(): void {
    if (!this.cliente || !this.data || !this.item || !this.funcionario || this.quantidade < 1 || this.valor <= 0) {
      this.mensagem = 'Preencha os campos corretamente.';
      return;
    }

    const dados = {
      idPessoa: this.cliente,
      dataAtendimento: this.data,
      statusAtendimento: 'Aberto',
      itens: [{
        idItem: this.item,
        idFuncionario: this.funcionario,
        quantidade: this.quantidade,
        valorUnitario: this.valor
      }]
    };

    this.http.post(this.url, dados).subscribe({
      next: () => {
        this.mensagem = 'Atendimento registrado.';
        this.listar();
      },
      error: erro => this.mensagem = typeof erro.error === 'string'
        ? erro.error
        : 'Não foi possível registrar o atendimento.'
    });
  }
}