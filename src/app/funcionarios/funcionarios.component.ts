import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './funcionarios.component.html',
  styleUrl: './funcionarios.component.css'
})
export class FuncionariosComponent implements OnInit {
  funcionarios: any[] = [];
  mensagem = '';
  busca = 0;
  editando: any = null;

  nome = '';
  cpf = '';
  nascimento = '';
  sexo = 'F';
  email = '';
  telefone = '';
  cep = '';
  numero = '';
  cargo = '';
  admissao = '';

  private url = 'http://localhost:5206/api/Funcionario';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.http.get<any[]>(this.url).subscribe({
      next: dados => this.funcionarios = dados,
      error: () => this.mensagem = 'Não foi possível listar funcionários.'
    });
  }

  consultar(): void {
    if (this.busca < 1) {
      this.mensagem = 'Informe um ID válido.';
      return;
    }

    this.http.get<any>(`${this.url}/${this.busca}`).subscribe({
      next: funcionario => this.funcionarios = [funcionario],
      error: () => this.mensagem = 'Funcionário não encontrado.'
    });
  }

  salvar(): void {
    if (!this.nome || !this.cpf || !this.email || !this.cargo || !this.nascimento || !this.admissao) {
      this.mensagem = 'Preencha os campos obrigatórios.';
      return;
    }

    const pessoa = {
      nome: this.nome,
      cpf: Number(this.cpf.replace(/\D/g, '')),
      dataNascimento: this.nascimento,
      sexo: this.sexo,
      email: this.email,
      telefone: Number(this.telefone.replace(/\D/g, '')),
      ativoPessoa: this.editando?.pessoa?.ativoPessoa || 'S',
      enderecos: this.editando?.pessoa?.enderecos?.length
        ? this.editando.pessoa.enderecos.map((endereco: any, indice: number) => indice === 0
          ? { ...endereco, cep: this.cep.replace(/\D/g, ''), numero: this.numero }
          : endereco)
        : [{ cep: this.cep.replace(/\D/g, ''), numero: this.numero, complemento: '' }]
    };

    const dados = {
      cargo: this.cargo,
      dataAdmissao: this.admissao,
      pessoa
    };

    const requisicao = this.editando
      ? this.http.put(`${this.url}/${this.editando.idPessoa}`, dados)
      : this.http.post(this.url, dados);

    requisicao.subscribe({
      next: () => {
        this.mensagem = this.editando ? 'Funcionário atualizado.' : 'Funcionário cadastrado.';
        this.cancelarEdicao();
        this.listar();
      },
      error: erro => this.mensagem = typeof erro.error === 'string'
        ? erro.error
        : 'Não foi possível salvar o funcionário.'
    });
  }

  editar(funcionario: any): void {
    this.editando = funcionario;
    this.nome = funcionario.pessoa?.nome || '';
    this.cpf = String(funcionario.pessoa?.cpf || '');
    this.nascimento = funcionario.pessoa?.dataNascimento || '';
    this.sexo = funcionario.pessoa?.sexo || 'F';
    this.email = funcionario.pessoa?.email || '';
    this.telefone = String(funcionario.pessoa?.telefone || '');
    this.cep = funcionario.pessoa?.enderecos?.[0]?.cep || '';
    this.numero = funcionario.pessoa?.enderecos?.[0]?.numero || '';
    this.cargo = funcionario.cargo || '';
    this.admissao = funcionario.dataAdmissao || '';
  }

  cancelarEdicao(): void {
    this.editando = null;
    this.nome = '';
    this.cpf = '';
    this.nascimento = '';
    this.sexo = 'F';
    this.email = '';
    this.telefone = '';
    this.cep = '';
    this.numero = '';
    this.cargo = '';
    this.admissao = '';
  }

  excluir(funcionario: any): void {
    this.http.delete(`${this.url}/${funcionario.idPessoa}`).subscribe({
      next: () => {
        this.mensagem = 'Funcionário excluído.';
        this.listar();
      },
      error: () => this.mensagem = 'Não foi possível excluir. Verifique se há atendimentos ou pedidos vinculados.'
    });
  }
}