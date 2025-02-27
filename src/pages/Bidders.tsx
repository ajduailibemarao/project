import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  X, 
  Edit, 
  Trash2, 
  Eye,
  FileSpreadsheet,
  File
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Schema for form validation
const bidderSchema = z.object({
  razaoSocial: z.string().min(1, 'Razão Social é obrigatória'),
  cnpj: z.string().min(14, 'CNPJ deve ter pelo menos 14 caracteres'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(2, 'Estado é obrigatório'),
  cep: z.string().min(8, 'CEP deve ter pelo menos 8 caracteres'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 caracteres'),
  email: z.string().email('Email inválido'),
  representanteLegal: z.string().min(1, 'Representante Legal é obrigatório'),
  cpfRepresentante: z.string().min(11, 'CPF deve ter pelo menos 11 caracteres'),
  observacoes: z.string().optional(),
});

type BidderFormData = z.infer<typeof bidderSchema>;

interface Bidder extends BidderFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
  situacao: string;
}

const Bidders: React.FC = () => {
  // State for bidders
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [filteredBidders, setFilteredBidders] = useState<Bidder[]>([]);
  
  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingBidder, setEditingBidder] = useState<Bidder | null>(null);
  const [viewingBidder, setViewingBidder] = useState<Bidder | null>(null);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [situacaoFilter, setSituacaoFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Form setup
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BidderFormData>({
    resolver: zodResolver(bidderSchema),
  });

  // Mock data for initial load
  useEffect(() => {
    const mockData: Bidder[] = [
      {
        id: '1',
        razaoSocial: 'Empresa ABC Ltda',
        cnpj: '12.345.678/0001-90',
        endereco: 'Rua das Flores, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        telefone: '(11) 98765-4321',
        email: 'contato@empresaabc.com.br',
        representanteLegal: 'João Silva',
        cpfRepresentante: '123.456.789-00',
        observacoes: 'Empresa com boa reputação no mercado',
        situacao: 'Ativo',
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-04-20T14:30:00Z'
      },
      {
        id: '2',
        razaoSocial: 'Tecnologia XYZ S.A.',
        cnpj: '98.765.432/0001-10',
        endereco: 'Av. Paulista, 1000',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-100',
        telefone: '(11) 3456-7890',
        email: 'contato@tecnologiaxyz.com.br',
        representanteLegal: 'Maria Oliveira',
        cpfRepresentante: '987.654.321-00',
        observacoes: 'Especializada em soluções tecnológicas',
        situacao: 'Ativo',
        createdAt: '2025-02-10T09:15:00Z',
        updatedAt: '2025-04-15T11:20:00Z'
      },
      {
        id: '3',
        razaoSocial: 'Construções Rápidas Ltda',
        cnpj: '45.678.901/0001-23',
        endereco: 'Rua dos Construtores, 456',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        cep: '20000-000',
        telefone: '(21) 2345-6789',
        email: 'contato@construcoesrapidas.com.br',
        representanteLegal: 'Carlos Santos',
        cpfRepresentante: '456.789.012-34',
        observacoes: 'Empresa com foco em obras públicas',
        situacao: 'Ativo',
        createdAt: '2025-03-05T08:30:00Z',
        updatedAt: '2025-04-10T16:45:00Z'
      },
      {
        id: '4',
        razaoSocial: 'Consultoria Financeira Ltda',
        cnpj: '56.789.012/0001-34',
        endereco: 'Av. Brasil, 789',
        cidade: 'Belo Horizonte',
        estado: 'MG',
        cep: '30000-000',
        telefone: '(31) 3456-7890',
        email: 'contato@consultoriafinanceira.com.br',
        representanteLegal: 'Ana Pereira',
        cpfRepresentante: '567.890.123-45',
        observacoes: 'Especializada em consultoria financeira',
        situacao: 'Inativo',
        createdAt: '2025-01-20T13:45:00Z',
        updatedAt: '2025-04-05T10:30:00Z'
      },
      {
        id: '5',
        razaoSocial: 'Distribuidora de Alimentos S.A.',
        cnpj: '67.890.123/0001-45',
        endereco: 'Rodovia BR 101, Km 100',
        cidade: 'Recife',
        estado: 'PE',
        cep: '50000-000',
        telefone: '(81) 3456-7890',
        email: 'contato@distribuidoraalimentos.com.br',
        representanteLegal: 'Roberto Lima',
        cpfRepresentante: '678.901.234-56',
        observacoes: 'Distribuidora de alimentos para todo o Nordeste',
        situacao: 'Ativo',
        createdAt: '2025-02-25T11:20:00Z',
        updatedAt: '2025-03-30T09:15:00Z'
      }
    ];
    
    setBidders(mockData);
    setFilteredBidders(mockData);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...bidders];
    
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(bidder => 
        bidder.razaoSocial.toLowerCase().includes(searchLower) ||
        bidder.cnpj.includes(searchTerm) ||
        bidder.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Situação filter
    if (situacaoFilter) {
      result = result.filter(bidder => bidder.situacao === situacaoFilter);
    }
    
    setFilteredBidders(result);
  }, [bidders, searchTerm, situacaoFilter]);

  // Open modal for new or edit
  const openModal = (bidder: Bidder | null = null) => {
    if (bidder) {
      setEditingBidder(bidder);
      Object.keys(bidder).forEach(key => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'situacao') {
          setValue(key as keyof BidderFormData, bidder[key as keyof Bidder]);
        }
      });
    } else {
      setEditingBidder(null);
      reset({
        razaoSocial: '',
        cnpj: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        telefone: '',
        email: '',
        representanteLegal: '',
        cpfRepresentante: '',
        observacoes: '',
      });
    }
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingBidder(null);
  };

  // Open detail modal
  const openDetailModal = (bidder: Bidder) => {
    setViewingBidder(bidder);
    setShowDetailModal(true);
  };

  // Close detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setViewingBidder(null);
  };

  // Handle form submit
  const onSubmit = (data: BidderFormData) => {
    if (editingBidder) {
      // Update existing bidder
      const updatedBidders = bidders.map(bidder => 
        bidder.id === editingBidder.id 
          ? { 
              ...bidder, 
              ...data, 
              updatedAt: new Date().toISOString() 
            } 
          : bidder
      );
      setBidders(updatedBidders);
      toast.success('Licitante atualizado com sucesso!');
    } else {
      // Add new bidder
      const newBidder: Bidder = {
        id: Date.now().toString(),
        ...data,
        situacao: 'Ativo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setBidders([...bidders, newBidder]);
      toast.success('Licitante cadastrado com sucesso!');
    }
    closeModal();
  };

  // Delete bidder
  const deleteBidder = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este licitante?')) {
      const updatedBidders = bidders.filter(bidder => bidder.id !== id);
      setBidders(updatedBidders);
      toast.success('Licitante excluído com sucesso!');
    }
  };

  // Toggle bidder status
  const toggleBidderStatus = (id: string) => {
    const updatedBidders = bidders.map(bidder => 
      bidder.id === id 
        ? { 
            ...bidder, 
            situacao: bidder.situacao === 'Ativo' ? 'Inativo' : 'Ativo',
            updatedAt: new Date().toISOString() 
          } 
        : bidder
    );
    setBidders(updatedBidders);
    toast.success('Status do licitante atualizado!');
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredBidders.map(bidder => ({
      'Razão Social': bidder.razaoSocial,
      'CNPJ': bidder.cnpj,
      'Endereço': bidder.endereco,
      'Cidade': bidder.cidade,
      'Estado': bidder.estado,
      'CEP': bidder.cep,
      'Telefone': bidder.telefone,
      'Email': bidder.email,
      'Representante Legal': bidder.representanteLegal,
      'CPF do Representante': bidder.cpfRepresentante,
      'Situação': bidder.situacao,
      'Data de Cadastro': format(new Date(bidder.createdAt), 'dd/MM/yyyy'),
      'Última Atualização': format(new Date(bidder.updatedAt), 'dd/MM/yyyy'),
      'Observações': bidder.observacoes || '',
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Licitantes');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(data, `licitantes_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
    toast.success('Dados exportados para Excel com sucesso!');
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Relatório de Licitantes', 14, 22);
    doc.setFontSize(11);
    doc.text(`Data de geração: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
    
    const tableColumn = ['Razão Social', 'CNPJ', 'Cidade/UF', 'Situação'];
    const tableRows = filteredBidders.map(bidder => [
      bidder.razaoSocial,
      bidder.cnpj,
      `${bidder.cidade}/${bidder.estado}`,
      bidder.situacao
    ]);
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    doc.save(`licitantes_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    toast.success('Dados exportados para PDF com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Licitantes</h1>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Licitante
        </button>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Buscar por razão social, CNPJ ou email..."
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </button>
            
            <div className="relative">
              <button
                onClick={() => document.getElementById('exportMenu')?.classList.toggle('hidden')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exportar para Excel
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    role="menuitem"
                  >
                    <File className="h-4 w-4 mr-2" />
                    Exportar para PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="situacaoFilter" className="block text-sm font-medium text-gray-700">
                  Situação
                </label>
                <select
                  id="situacaoFilter"
                  value={situacaoFilter}
                  onChange={(e) => setSituacaoFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Todos</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bidders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Razão Social
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CNPJ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cidade/UF
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Situação
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBidders.length > 0 ? (
                filteredBidders.map((bidder) => (
                  <tr key={bidder.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{bidder.razaoSocial}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{bidder.cnpj}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{bidder.cidade}/{bidder.estado}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{bidder.telefone}</div>
                      <div className="text-sm text-gray-500">{bidder.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        bidder.situacao === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {bidder.situacao}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openDetailModal(bidder)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openModal(bidder)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => toggleBidderStatus(bidder.id)}
                        className={`${
                          bidder.situacao === 'Ativo' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        } mr-3`}
                      >
                        {bidder.situacao === 'Ativo' ? 'Inativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => deleteBidder(bidder.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum licitante encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Form Modal */}
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
                    {editingBidder ? 'Editar Licitante' : 'Novo Licitante'}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="razaoSocial" className="block text-sm font-medium text-gray-700">
                        Razão Social
                      </label>
                      <input
                        type="text"
                        id="razaoSocial"
                        {...register('razaoSocial')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.razaoSocial && (
                        <p className="mt-1 text-sm text-red-600">{errors.razaoSocial.message}</p>
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
                    
                    <div>
                      <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
                        Endereço
                      </label>
                      <input
                        type="text"
                        id="endereco"
                        {...register('endereco')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.endereco && (
                        <p className="mt-1 text-sm text-red-600">{errors.endereco.message}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">
                          Cidade
                        </label>
                        <input
                          type="text"
                          id="cidade"
                          {...register('cidade')}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                        {errors.cidade && (
                          <p className="mt-1 text-sm text-red-600">{errors.cidade.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                          Estado
                        </label>
                        <input
                          type="text"
                          id="estado"
                          {...register('estado')}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                        {errors.estado && (
                          <p className="mt-1 text-sm text-red-600">{errors.estado.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="cep" className="block text-sm font-medium text-gray-700">
                        CEP
                      </label>
                      <input
                        type="text"
                        id="cep"
                        {...register('cep')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.cep && (
                        <p className="mt-1 text-sm text-red-600">{errors.cep.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
                        Telefone
                      </label>
                      <input
                        type="text"
                        id="telefone"
                        {...register('telefone')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.telefone && (
                        <p className="mt-1 text-sm text-red-600">{errors.telefone.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        {...register('email')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="representanteLegal" className="block text-sm font-medium text-gray-700">
                        Representante Legal
                      </label>
                      <input
                        type="text"
                        id="representanteLegal"
                        {...register('representanteLegal')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.representanteLegal && (
                        <p className="mt-1 text-sm text-red-600">{errors.representanteLegal.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="cpfRepresentante" className="block text-sm font-medium text-gray-700">
                        CPF do Representante
                      </label>
                      <input
                        type="text"
                        id="cpfRepresentante"
                        {...register('cpfRepresentante')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.cpfRepresentante && (
                        <p className="mt-1 text-sm text-red-600">{errors.cpfRepresentante.message}</p>
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
                      {editingBidder ? 'Atualizar' : 'Cadastrar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Detail Modal */}
      {showDetailModal && viewingBidder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Detalhes do Licitante
                  </h3>
                  <button onClick={closeDetailModal} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Razão Social</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">{viewingBidder.razaoSocial}</div>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">CNPJ</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">{viewingBidder.cnpj}</div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Endereço</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">
                      {viewingBidder.endereco}, {viewingBidder.cidade}/{viewingBidder.estado}, CEP: {viewingBidder.cep}
                    </div>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Contato</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">
                      <div>{viewingBidder.telefone}</div>
                      <div>{viewingBidder.email}</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Representante Legal</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">
                      {viewingBidder.representanteLegal} (CPF: {viewingBidder.cpfRepresentante})
                    </div>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Situação</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${viewingBidder.situacao === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {viewingBidder.situacao}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Data de Cadastro</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">
                      {format(new Date(viewingBidder.createdAt), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Última Atualização</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">
                      {format(new Date(viewingBidder.updatedAt), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </div>
                  
                  {viewingBidder.observacoes && (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Observações</div>
                      <div className="mt-1 text-sm text-gray-900 sm:mt-0">{viewingBidder.observacoes}</div>
                    </div>
                  )}
                </div>
                
                <div className="mt-5 sm:mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={closeDetailModal}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeDetailModal();
                      openModal(viewingBidder);
                    }}
                    className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bidders;