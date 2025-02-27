import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Plus, Filter, Download, X, Edit, Trash2, Eye, FileSpreadsheet, File as FilePdf, AlertTriangle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Schema for form validation
const penaltySchema = z.object({
  fornecedor: z.string().min(1, 'Fornecedor é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ deve ter pelo menos 14 caracteres'),
  processo: z.string().min(1, 'Processo é obrigatório'),
  tipoSancao: z.string().min(1, 'Tipo de sanção é obrigatório'),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
  motivo: z.string().min(1, 'Motivo é obrigatório'),
  fundamentacaoLegal: z.string().min(1, 'Fundamentação legal é obrigatória'),
  observacoes: z.string().optional(),
});

type PenaltyFormData = z.infer<typeof penaltySchema>;

interface Penalty extends PenaltyFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

const Penalties: React.FC = () => {
  // State for penalties
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [filteredPenalties, setFilteredPenalties] = useState<Penalty[]>([]);
  
  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingPenalty, setEditingPenalty] = useState<Penalty | null>(null);
  const [viewingPenalty, setViewingPenalty] = useState<Penalty | null>(null);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoSancaoFilter, setTipoSancaoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Form setup
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PenaltyFormData>({
    resolver: zodResolver(penaltySchema),
  });

  // Mock data for initial load
  useEffect(() => {
    const mockData: Penalty[] = [
      {
        id: '1',
        fornecedor: 'Empresa ABC Ltda',
        cnpj: '12.345.678/0001-90',
        processo: 'PE-2025-001',
        tipoSancao: 'Advertência',
        dataInicio: '2025-01-15',
        dataFim: '2025-04-15',
        motivo: 'Atraso na entrega dos produtos',
        fundamentacaoLegal: 'Art. 87, I da Lei 8.666/93',
        observacoes: 'Primeira ocorrência',
        status: 'Ativa',
        createdAt: '2025-01-10T10:00:00Z',
        updatedAt: '2025-01-10T10:00:00Z'
      },
      {
        id: '2',
        fornecedor: 'Tecnologia XYZ S.A.',
        cnpj: '98.765.432/0001-10',
        processo: 'PE-2025-004',
        tipoSancao: 'Multa',
        dataInicio: '2025-02-10',
        dataFim: '2025-05-10',
        motivo: 'Descumprimento de cláusulas contratuais',
        fundamentacaoLegal: 'Art. 87, II da Lei 8.666/93',
        observacoes: 'Multa de 10% sobre o valor do contrato',
        status: 'Ativa',
        createdAt: '2025-02-05T09:15:00Z',
        updatedAt: '2025-02-05T09:15:00Z'
      },
      {
        id: '3',
        fornecedor: 'Construções Rápidas Ltda',
        cnpj: '45.678.901/0001-23',
        processo: 'CC-2025-002',
        tipoSancao: 'Suspensão temporária',
        dataInicio: '2025-03-05',
        dataFim: '2026-03-05',
        motivo: 'Inexecução total do contrato',
        fundamentacaoLegal: 'Art. 87, III da Lei 8.666/93',
        observacoes: 'Suspensão por 12 meses',
        status: 'Ativa',
        createdAt: '2025-03-01T08:30:00Z',
        updatedAt: '2025-03-01T08:30:00Z'
      },
      {
        id: '4',
        fornecedor: 'Consultoria Financeira Ltda',
        cnpj: '56.789.012/0001-34',
        processo: 'TP-2025-003',
        tipoSancao: 'Declaração de inidoneidade',
        dataInicio: '2025-01-20',
        dataFim: '2027-01-20',
        motivo: 'Fraude na execução do contrato',
        fundamentacaoLegal: 'Art. 87, IV da Lei 8.666/93',
        observacoes: 'Declaração de inidoneidade por 2 anos',
        status: 'Ativa',
        createdAt: '2025-01-15T13:45:00Z',
        updatedAt: '2025-01-15T13:45:00Z'
      },
      {
        id: '5',
        fornecedor: 'Distribuidora de Alimentos S.A.',
        cnpj: '67.890.123/0001-45',
        processo: 'PE-2024-015',
        tipoSancao: 'Advertência',
        dataInicio: '2024-10-25',
        dataFim: '2025-01-25',
        motivo: 'Entrega de produtos fora das especificações',
        fundamentacaoLegal: 'Art. 87, I da Lei 8.666/93',
        observacoes: 'Penalidade cumprida',
        status: 'Encerrada',
        createdAt: '2024-10-20T11:20:00Z',
        updatedAt: '2025-01-26T09:15:00Z'
      }
    ];
    
    setPenalties(mockData);
    setFilteredPenalties(mockData);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...penalties];
    
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(penalty => 
        penalty.fornecedor.toLowerCase().includes(searchLower) ||
        penalty.cnpj.includes(searchTerm) ||
        penalty.processo.toLowerCase().includes(searchLower)
      );
    }
    
    // Tipo de sanção filter
    if (tipoSancaoFilter) {
      result = result.filter(penalty => penalty.tipoSancao === tipoSancaoFilter);
    }
    
    // Status filter
    if (statusFilter) {
      result = result.filter(penalty => penalty.status === statusFilter);
    }
    
    setFilteredPenalties(result);
  }, [penalties, searchTerm, tipoSancaoFilter, statusFilter]);

  // Open modal for new or edit
  const openModal = (penalty: Penalty | null = null) => {
    if (penalty) {
      setEditingPenalty(penalty);
      Object.keys(penalty).forEach(key => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'status') {
          setValue(key as keyof PenaltyFormData, penalty[key as keyof Penalty]);
        }
      });
    } else {
      setEditingPenalty(null);
      reset({
        fornecedor: '',
        cnpj: '',
        processo: '',
        tipoSancao: '',
        dataInicio: '',
        dataFim: '',
        motivo: '',
        fundamentacaoLegal: '',
        observacoes: '',
      });
    }
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingPenalty(null);
  };

  // Open detail modal
  const openDetailModal = (penalty: Penalty) => {
    setViewingPenalty(penalty);
    setShowDetailModal(true);
  };

  // Close detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setViewingPenalty(null);
  };

  // Handle form submit
  const onSubmit = (data: PenaltyFormData) => {
    if (editingPenalty) {
      // Update existing penalty
      const updatedPenalties = penalties.map(penalty => 
        penalty.id === editingPenalty.id 
          ? { 
              ...penalty, 
              ...data, 
              updatedAt: new Date().toISOString(),
              status: new Date(data.dataFim) > new Date() ? 'Ativa' : 'Encerrada'
            } 
          : penalty
      );
      setPenalties(updatedPenalties);
      toast.success('Penalidade atualizada com sucesso!');
    } else {
      // Add new penalty
      const newPenalty: Penalty = {
        id: Date.now().toString(),
        ...data,
        status: new Date(data.dataFim) > new Date() ? 'Ativa' : 'Encerrada',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPenalties([...penalties, newPenalty]);
      toast.success('Penalidade cadastrada com sucesso!');
    }
    closeModal();
  };

  // Delete penalty
  const deletePenalty = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta penalidade?')) {
      const updatedPenalties = penalties.filter(penalty => penalty.id !== id);
      setPenalties(updatedPenalties);
      toast.success('Penalidade excluída com sucesso!');
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPenalties.map(penalty => ({
      'Fornecedor': penalty.fornecedor,
      'CNPJ': penalty.cnpj,
      'Processo': penalty.processo,
      'Tipo de Sanção': penalty.tipoSancao,
      'Data de Início': format(new Date(penalty.dataInicio), 'dd/MM/yyyy'),
      'Data de Fim': format(new Date(penalty.dataFim), 'dd/MM/yyyy'),
      'Motivo': penalty.motivo,
      'Fundamentação Legal': penalty.fundamentacaoLegal,
      'Status': penalty.status,
      'Observações': penalty.observacoes || '',
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Penalidades');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(data, `penalidades_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
    toast.success('Dados exportados para Excel com sucesso!');
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Relatório de Penalidades', 14, 22);
    doc.setFontSize(11);
    doc.text(`Data de geração: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
    
    const tableColumn = ['Fornecedor', 'Tipo de Sanção', 'Período', 'Status'];
    const tableRows = filteredPenalties.map(penalty => [
      penalty.fornecedor,
      penalty.tipoSancao,
      `${format(new Date(penalty.dataInicio), 'dd/MM/yyyy')} a ${format(new Date(penalty.dataFim), 'dd/MM/yyyy')}`,
      penalty.status
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
    
    doc.save(`penalidades_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    toast.success('Dados exportados para PDF com sucesso!');
  };

  // Calculate remaining days for active penalties
  const getRemainingDays = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    if (end < today) return 0;
    return differenceInDays(end, today);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Penalidades</h1>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Penalidade
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
                placeholder="Buscar por fornecedor, CNPJ ou processo..."
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
                    <FilePdf className="h-4 w-4 mr-2" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tipoSancaoFilter" className="block text-sm font-medium text-gray-700">
                  Tipo de Sanção
                </label>
                <select
                  id="tipoSancaoFilter"
                  value={tipoSancaoFilter}
                  onChange={(e) => setTipoSancaoFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Todos</option>
                  <option value="Advertência">Advertência</option>
                  <option value="Multa">Multa</option>
                  <option value="Suspensão temporária">Suspensão temporária</option>
                  <option value="Declaração de inidoneidade">Declaração de inidoneidade</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Todos</option>
                  <option value="Ativa">Ativa</option>
                  <option value="Encerrada">Encerrada</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Penalties Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fornecedor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Processo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Sanção
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPenalties.length > 0 ? (
                filteredPenalties.map((penalty) => (
                  <tr key={penalty.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{penalty.fornecedor}</div>
                      <div className="text-xs text-gray-500">{penalty.cnpj}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{penalty.processo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{penalty.tipoSancao}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(penalty.dataInicio), 'dd/MM/yyyy')} a {format(new Date(penalty.dataFim), 'dd/MM/yyyy')}
                      </div>
                      {penalty.status === 'Ativa' && (
                        <div className="text-xs text-orange-600">
                          Restam {getRemainingDays(penalty.dataFim)} dias
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        penalty.status === 'Ativa' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {penalty.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openDetailModal(penalty)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openModal(penalty)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => deletePenalty(penalty.id)}
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
                    Nenhuma penalidade encontrada
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
                    {editingPenalty ? 'Editar Penalidade' : 'Nova Penalidade'}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    
                    <div>
                      <label htmlFor="processo" className="block text-sm font-medium text-gray-700">
                        Processo
                      </label>
                      <input
                        type="text"
                        id="processo"
                        {...register('processo')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.processo && (
                        <p className="mt-1 text-sm text-red-600">{errors.processo.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="tipoSancao" className="block text-sm font-medium text-gray-700">
                        Tipo de Sanção
                      </label>
                      <select
                        id="tipoSancao"
                        {...register('tipoSancao')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="">Selecione...</option>
                        <option value="Advertência">Advertência</option>
                        <option value="Multa">Multa</option>
                        <option value="Suspensão temporária">Suspensão temporária</option>
                        <option value="Declaração de inidoneidade">Declaração de inidoneidade</option>
                      </select>
                      {errors.tipoSancao && (
                        <p className="mt-1 text-sm text-red-600">{errors.tipoSancao.message}</p>
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
                    
                    <div className="col-span-2">
                      <label htmlFor="motivo" className="block text-sm font-medium text-gray-700">
                        Motivo
                      </label>
                      <textarea
                        id="motivo"
                        rows={2}
                        {...register('motivo')}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      {errors.motivo && (
                        <p className="mt-1 text-sm text-red-600">{errors.motivo.message}</p>
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
                      {editingPenalty ? 'Atualizar' : 'Cadastrar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Detail Modal */}
      {showDetailModal && viewingPenalty && (
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
                    Detalhes da Penalidade
                  </h3>
                  <button onClick={closeDetailModal} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Fornecedor</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">{viewingPenalty.fornecedor}</div>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">CNPJ</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">{viewingPenalty.cnpj}</div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Processo</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">{viewingPenalty.processo}</div>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Tipo de Sanção</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">{viewingPenalty.tipoSancao}</div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Período</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">
                      {format(new Date(viewingPenalty.dataInicio), 'dd/MM/yyyy')} a {format(new Date(viewingPenalty.dataFim), 'dd/MM/yyyy')}
                    </div>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Status</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${viewingPenalty.status === 'Ativa' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {viewingPenalty.status}
                      </span>
                      {viewingPenalty.status === 'Ativa' && (
                        <span className="ml-2 text-xs text-orange-600">
                          Restam {getRemainingDays(viewingPenalty.dataFim)} dias
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Motivo</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">{viewingPenalty.motivo}</div>
                  </div>
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Fundamentação Legal</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">{viewingPenalty.fundamentacaoLegal}</div>
                  </div>
                  
                  {viewingPenalty.observacoes && (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Observações</div>
                      <div className="mt-1 text-sm text-gray-900 sm:mt-0">{viewingPenalty.observacoes}</div>
                    </div>
                  )}
                  
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Data de Cadastro</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">
                      {format(new Date(viewingPenalty.createdAt), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">Última Atualização</div>
                    <div className="mt-1 text-sm text-gray-900 sm:mt-0">
                      {format(new Date(viewingPenalty.updatedAt), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </div>
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
                      openModal(viewingPenalty);
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

export default Penalties;