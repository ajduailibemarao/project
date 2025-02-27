import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Plus, Filter, Download, X, Edit, Trash2, Eye, FileSpreadsheet, FileText, File } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Schema para validação do formulário
const directContractSchema = z.object({
  identificacao: z.string().min(1, 'Identificação é obrigatória'),
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  fornecedor: z.string().min(1, 'Fornecedor é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ deve ter pelo menos 14 caracteres'),
  objeto: z.string().min(1, 'Objeto é obrigatório'),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
  valorTotal: z.coerce.number().min(0, 'Valor total deve ser maior ou igual a zero'),
  numeroParecer: z.string().min(1, 'Número do parecer é obrigatório'),
  dataParecer: z.string().min(1, 'Data do parecer é obrigatória'),
  fundamentacaoLegal: z.string().min(1, 'Fundamentação legal é obrigatória'),
  status: z.string().min(1, 'Status é obrigatório'),
  setor: z.string().min(1, 'Setor é obrigatório'),
  diretoria: z.string().min(1, 'Diretoria é obrigatória'),
  observacoes: z.string().optional(),
});

type DirectContractFormData = z.infer<typeof directContractSchema>;

interface DirectContract extends DirectContractFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

const DirectContracts: React.FC = () => {
  // Estado para contratações diretas
  const [contracts, setContracts] = useState<DirectContract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<DirectContract[]>([]);
  
  // Estados para modais
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingContract, setEditingContract] = useState<DirectContract | null>(null);
  const [viewingContract, setViewingContract] = useState<DirectContract | null>(null);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Configuração do formulário
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<DirectContractFormData>({
    resolver: zodResolver(directContractSchema),
    defaultValues: {
      valorTotal: 0,
    }
  });

  // Dados mock para carregamento inicial
  useEffect(() => {
    const mockData: DirectContract[] = [
      {
        id: '1',
        identificacao: 'DL-2025-001',
        tipo: 'Dispensa',
        fornecedor: 'Empresa ABC Ltda',
        cnpj: '12.345.678/0001-90',
        objeto: 'Aquisição de material de escritório',
        dataInicio: '2025-05-01',
        dataFim: '2025-11-01',
        valorTotal: 15000,
        numeroParecer: 'PAR-2025-001',
        dataParecer: '2025-04-20',
        fundamentacaoLegal: 'Art. 24, II da Lei 8.666/93',
        status: 'Vigente',
        setor: 'Compras',
        diretoria: 'Administrativa',
        observacoes: 'Contratação emergencial',
        createdAt: '2025-04-25T10:00:00Z',
        updatedAt: '2025-04-25T10:00:00Z'
      },
      {
        id: '2',
        identificacao: 'IN-2025-002',
        tipo: 'Inexigibilidade',
        fornecedor: 'Tecnologia XYZ S.A.',
        cnpj: '98.765.432/0001-10',
        objeto: 'Manutenção de software especializado',
        dataInicio: '2025-04-15',
        dataFim: '2026-04-15',
        valorTotal: 120000,
        numeroParecer: 'PAR-2025-002',
        dataParecer: '2025-04-10',
        fundamentacaoLegal: 'Art. 25, I da Lei 8.666/93',
        status: 'Vigente',
        setor: 'TI',
        diretoria: 'Tecnologia',
        observacoes: 'Fornecedor exclusivo',
        createdAt: '2025-04-12T09:15:00Z',
        updatedAt: '2025-04-12T09:15:00Z'
      },
      {
        id: '3',
        identificacao: 'DL-2025-003',
        tipo: 'Dispensa',
        fornecedor: 'Construções Rápidas Ltda',
        cnpj: '45.678.901/0001-23',
        objeto: 'Pequenos reparos no prédio administrativo',
        dataInicio: '2025-03-10',
        dataFim: '2025-04-10',
        valorTotal: 28000,
        numeroParecer: 'PAR-2025-003',
        dataParecer: '2025-03-05',
        fundamentacaoLegal: 'Art. 24, I da Lei 8.666/93',
        status: 'Encerrado',
        setor: 'Manutenção',
        diretoria: 'Infraestrutura',
        observacoes: 'Serviço concluído dentro do prazo',
        createdAt: '2025-03-08T08:30:00Z',
        updatedAt: '2025-04-11T16:45:00Z'
      },
      {
        id: '4',
        identificacao: 'IN-2025-004',
        tipo: 'Inexigibilidade',
        fornecedor: 'Consultoria Financeira Ltda',
        cnpj: '56.789.012/0001-34',
        objeto: 'Consultoria especializada em finanças públicas',
        dataInicio: '2025-06-01',
        dataFim: '2025-12-01',
        valorTotal: 85000,
        numeroParecer: 'PAR-2025-004',
        dataParecer: '2025-05-20',
        fundamentacaoLegal: 'Art. 25, II da Lei 8.666/93',
        status: 'Em Elaboração',
        setor: 'Financeiro',
        diretoria: 'Financeira',
        observacoes: 'Aguardando assinatura do contrato',
        createdAt: '2025-05-15T13:45:00Z',
        updatedAt: '2025-05-15T13:45:00Z'
      },
      {
        id: '5',
        identificacao: 'DL-2025-005',
        tipo: 'Dispensa',
        fornecedor: 'Distribuidora de Alimentos S.A.',
        cnpj: '67.890.123/0001-45',
        objeto: 'Fornecimento de coffee break para eventos',
        dataInicio: '2025-05-15',
        dataFim: '2025-11-15',
        valorTotal: 18000,
        numeroParecer: 'PAR-2025-005',
        dataParecer: '2025-05-10',
        fundamentacaoLegal: 'Art. 24, II da Lei 8.666/93',
        status: 'Vigente',
        setor: 'Eventos',
        diretoria: 'Administrativa',
        observacoes: 'Contrato para eventos institucionais',
        createdAt: '2025-05-12T11:20:00Z',
        updatedAt: '2025-05-12T11:20:00Z'
      }
    ];
    
    setContracts(mockData);
    setFilteredContracts(mockData);
  }, []);

  // Aplicação dos filtros
  useEffect(() => {
    let result = [...contracts];
    
    // Filtro por termo de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(contract => 
        contract.identificacao.toLowerCase().includes(searchLower) ||
        contract.fornecedor.toLowerCase().includes(searchLower) ||
        contract.objeto.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtro por tipo
    if (tipoFilter) {
      result = result.filter(contract => contract.tipo === tipoFilter);
    }
    
    // Filtro por status
    if (statusFilter) {
      result = result.filter(contract => contract.status === statusFilter);
    }
    
    setFilteredContracts(result);
  }, [contracts, searchTerm, tipoFilter, statusFilter]);

  // Abertura do modal para cadastro ou edição
  const openModal = (contract: DirectContract | null = null) => {
    if (contract) {
      setEditingContract(contract);
      Object.keys(contract).forEach(key => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
          setValue(key as keyof DirectContractFormData, contract[key as keyof DirectContract]);
        }
      });
    } else {
      setEditingContract(null);
      reset({
        identificacao: '',
        tipo: '',
        fornecedor: '',
        cnpj: '',
        objeto: '',
        dataInicio: '',
        dataFim: '',
        valorTotal: 0,
        numeroParecer: '',
        dataParecer: '',
        fundamentacaoLegal: '',
        status: '',
        setor: '',
        diretoria: '',
        observacoes: '',
      });
    }
    setShowModal(true);
  };

  // Fechamento do modal de cadastro/edição
  const closeModal = () => {
    setShowModal(false);
    setEditingContract(null);
    reset();
  };

  // Abertura do modal de detalhes
  const openDetailModal = (contract: DirectContract) => {
    setViewingContract(contract);
    setShowDetailModal(true);
  };

  // Fechamento do modal de detalhes
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setViewingContract(null);
  };

  // Submissão do formulário
  const onSubmit = (data: DirectContractFormData) => {
    if (editingContract) {
      // Atualiza a contratação existente
      const updatedContracts = contracts.map(contract => 
        contract.id === editingContract.id 
          ? { 
              ...contract, 
              ...data, 
              updatedAt: new Date().toISOString() 
            } 
          : contract
      );
      setContracts(updatedContracts);
      toast.success('Contratação direta atualizada com sucesso!');
    } else {
      // Cria nova contratação
      const newContract: DirectContract = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setContracts([...contracts, newContract]);
      toast.success('Contratação direta cadastrada com sucesso!');
    }
    closeModal();
  };

  // Exclusão de contratação
  const deleteContract = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta contratação direta?')) {
      const updatedContracts = contracts.filter(contract => contract.id !== id);
      setContracts(updatedContracts);
      toast.success('Contratação direta excluída com sucesso!');
    }
  };

  // Exportação para Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredContracts.map(contract => ({
        'Identificação': contract.identificacao,
        'Tipo': contract.tipo,
        'Fornecedor': contract.fornecedor,
        'CNPJ': contract.cnpj,
        'Objeto': contract.objeto,
        'Data de Início': format(new Date(contract.dataInicio), 'dd/MM/yyyy'),
        'Data de Fim': format(new Date(contract.dataFim), 'dd/MM/yyyy'),
        'Valor Total (R$)': contract.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        'Parecer Jurídico': contract.numeroParecer,
        'Data do Parecer': format(new Date(contract.dataParecer), 'dd/MM/yyyy'),
        'Fundamentação Legal': contract.fundamentacaoLegal,
        'Status': contract.status,
        'Setor': contract.setor,
        'Diretoria': contract.diretoria,
        'Observações': contract.observacoes || 'N/A'
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contratações Diretas');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(data, `contratacoes_diretas_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Relatório exportado com sucesso!');
  };

  // Exportação para PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Título do relatório
    doc.setFontSize(18);
    doc.text('Relatório de Contratações Diretas', 14, 22);
    
    // Data de geração
    doc.setFontSize(11);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
    
    // Tabela com os dados
    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Tipo', 'Fornecedor', 'Valor Total', 'Status']],
      body: filteredContracts.map(contract => [
        contract.identificacao,
        contract.tipo,
        contract.fornecedor,
        `R$ ${contract.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        contract.status
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Salvamento do PDF
    doc.save(`contratacoes_diretas_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF exportado com sucesso!');
  };

  // Funções para obtenção dos valores únicos dos filtros
  const getUniqueTypes = () => {
    const types = new Set(contracts.map(contract => contract.tipo));
    return Array.from(types);
  };
  
  const getUniqueStatuses = () => {
    const statuses = new Set(contracts.map(contract => contract.status));
    return Array.from(statuses);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Contratações Diretas</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => openModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Contratação
          </button>
        </div>
      </div>
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total de Contratações */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Contratações</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {filteredContracts?.length ?? 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
  
        {/* Vigentes / Em Elaboração */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Vigentes / Em Elaboração</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {(filteredContracts?.filter(c => c.status === 'Vigente').length) || 0} / {(filteredContracts?.filter(c => c.status === 'Em Elaboração').length) || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
  
        {/* Valor Total */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Valor Total</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      R$ {(filteredContracts?.reduce((sum, c) => sum + (c.valorTotal || 0), 0) ?? 0)
                        .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
  
        {/* Dispensas / Inexigibilidades */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Dispensas / Inexigibilidades
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {(filteredContracts?.filter(c => c.tipo === 'Dispensa').length) || 0} / {(filteredContracts?.filter(c => c.tipo === 'Inexigibilidade').length) || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      {/* Busca e Filtros */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Buscar por identificação, fornecedor ou objeto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </button>
            
            <div className="relative">
              <button
                onClick={() => document.getElementById('exportMenu')?.classList.toggle('hidden')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              
              <div id="exportMenu" className="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    onClick={exportToExcel}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    role="menuitem"
                  >
                    <FileSpreadsheet className="mr-3 h-5 w-5 text-green-500" />
                    Exportar para Excel
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    role="menuitem"
                  >
                    <File className="mr-3 h-5 w-5 text-red-500" />
                    Exportar para PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tipoFilter" className="block text-sm font-medium text-gray-700">
                Tipo
              </label>
              <select
                id="tipoFilter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
              >
                <option value="">Todos</option>
                {getUniqueTypes().map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="statusFilter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos</option>
                {getUniqueStatuses().map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      
      {/* Tabela de Contratações Diretas */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Identificação
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fornecedor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Objeto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContracts.length > 0 ? (
                filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contract.identificacao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${contract.tipo === 'Dispensa' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                        {contract.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contract.fornecedor}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {contract.objeto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(contract.dataInicio), 'dd/MM/yyyy')} a {format(new Date(contract.dataFim), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      R$ {contract.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${contract.status === 'Vigente' ? 'bg-green-100 text-green-800' : 
                          contract.status === 'Em Elaboração' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openDetailModal(contract)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openModal(contract)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteContract(contract.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhuma contratação direta encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {editingContract ? 'Editar Contratação Direta' : 'Nova Contratação Direta'}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="identificacao" className="block text-sm font-medium text-gray-700">
                        Identificação
                      </label>
                      <input
                        type="text"
                        id="identificacao"
                        {...register('identificacao')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.identificacao && (
                        <p className="mt-1 text-sm text-red-600">{errors.identificacao.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                        Tipo
                      </label>
                      <select
                        id="tipo"
                        {...register('tipo')}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="">Selecione...</option>
                        <option value="Dispensa">Dispensa</option>
                        <option value="Inexigibilidade">Inexigibilidade</option>
                      </select>
                      {errors.tipo && (
                        <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="fornecedor" className="block text-sm font-medium text-gray-700">
                        Fornecedor
                      </label>
                      <input
                        type="text"
                        id="fornecedor"
                        {...register('fornecedor')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.fornecedor && (
                        <p className="mt-1 text-sm text-red-600">{errors.fornecedor.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">
                        CNPJ
                      </label>
                      <input
                        type="text"
                        id="cnpj"
                        {...register('cnpj')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.cnpj && (
                        <p className="mt-1 text-sm text-red-600">{errors.cnpj.message}</p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <label htmlFor="objeto" className="block text-sm font-medium text-gray-700">
                        Objeto
                      </label>
                      <textarea
                        id="objeto"
                        rows={3}
                        {...register('objeto')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.objeto && (
                        <p className="mt-1 text-sm text-red-600">{errors.objeto.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700">
                        Data de Início
                      </label>
                      <input
                        type="date"
                        id="dataInicio"
                        {...register('dataInicio')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.dataInicio && (
                        <p className="mt-1 text-sm text-red-600">{errors.dataInicio.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700">
                        Data de Fim
                      </label>
                      <input
                        type="date"
                        id="dataFim"
                        {...register('dataFim')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.dataFim && (
                        <p className="mt-1 text-sm text-red-600">{errors.dataFim.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="valorTotal" className="block text-sm font-medium text-gray-700">
                        Valor Total (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        id="valorTotal"
                        {...register('valorTotal')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.valorTotal && (
                        <p className="mt-1 text-sm text-red-600">{errors.valorTotal.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="status"
                        {...register('status')}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="">Selecione...</option>
                        <option value="Em Elaboração">Em Elaboração</option>
                        <option value="Vigente">Vigente</option>
                        <option value="Encerrado">Encerrado</option>
                      </select>
                      {errors.status && (
                        <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="numeroParecer" className="block text-sm font-medium text-gray-700">
                        Número do Parecer
                      </label>
                      <input
                        type="text"
                        id="numeroParecer"
                        {...register('numeroParecer')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.numeroParecer && (
                        <p className="mt-1 text-sm text-red-600">{errors.numeroParecer.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="dataParecer" className="block text-sm font-medium text-gray-700">
                        Data do Parecer
                      </label>
                      <input
                        type="date"
                        id="dataParecer"
                        {...register('dataParecer')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.dataParecer && (
                        <p className="mt-1 text-sm text-red-600">{errors.dataParecer.message}</p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <label htmlFor="fundamentacaoLegal" className="block text-sm font-medium text-gray-700">
                        Fundamentação Legal
                      </label>
                      <input
                        type="text"
                        id="fundamentacaoLegal"
                        {...register('fundamentacaoLegal')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.fundamentacaoLegal && (
                        <p className="mt-1 text-sm text-red-600">{errors.fundamentacaoLegal.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="setor" className="block text-sm font-medium text-gray-700">
                        Setor
                      </label>
                      <input
                        type="text"
                        id="setor"
                        {...register('setor')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.setor && (
                        <p className="mt-1 text-sm text-red-600">{errors.setor.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="diretoria" className="block text-sm font-medium text-gray-700">
                        Diretoria
                      </label>
                      <input
                        type="text"
                        id="diretoria"
                        {...register('diretoria')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.diretoria && (
                        <p className="mt-1 text-sm text-red-600">{errors.diretoria.message}</p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">
                        Observações
                      </label>
                      <textarea
                        id="observacoes"
                        rows={3}
                        {...register('observacoes')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.observacoes && (
                        <p className="mt-1 text-sm text-red-600">{errors.observacoes.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t flex justify-end mt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {editingContract ? 'Atualizar' : 'Cadastrar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Detalhes */}
      {showDetailModal && viewingContract && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Detalhes da Contratação
                  </h3>
                  <button onClick={closeDetailModal} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="mt-4">
                  <p><strong>Identificação:</strong> {viewingContract.identificacao}</p>
                  <p><strong>Tipo:</strong> {viewingContract.tipo}</p>
                  <p><strong>Fornecedor:</strong> {viewingContract.fornecedor}</p>
                  <p><strong>CNPJ:</strong> {viewingContract.cnpj}</p>
                  <p><strong>Objeto:</strong> {viewingContract.objeto}</p>
                  <p><strong>Data de Início:</strong> {format(new Date(viewingContract.dataInicio), 'dd/MM/yyyy')}</p>
                  <p><strong>Data de Fim:</strong> {format(new Date(viewingContract.dataFim), 'dd/MM/yyyy')}</p>
                  <p><strong>Valor Total:</strong> R$ {viewingContract.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p><strong>Número do Parecer:</strong> {viewingContract.numeroParecer}</p>
                  <p><strong>Data do Parecer:</strong> {format(new Date(viewingContract.dataParecer), 'dd/MM/yyyy')}</p>
                  <p><strong>Fundamentação Legal:</strong> {viewingContract.fundamentacaoLegal}</p>
                  <p><strong>Status:</strong> {viewingContract.status}</p>
                  <p><strong>Setor:</strong> {viewingContract.setor}</p>
                  <p><strong>Diretoria:</strong> {viewingContract.diretoria}</p>
                  <p><strong>Observações:</strong> {viewingContract.observacoes || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectContracts;
