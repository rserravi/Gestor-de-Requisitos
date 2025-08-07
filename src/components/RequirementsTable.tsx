import { useState, useMemo } from "react";
import {
  Plus, Edit2, Trash2, Image, Save, X,
  Search, Filter, ChevronUp, ChevronDown, List as TableIcon
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { getTranslations, type Language } from "../i18n";

interface Requirement {
  id: string;
  description: string;
  status: 'draft' | 'approved' | 'rejected' | 'in-review';
  category: 'functional' | 'performance' | 'usability' | 'security' | 'technical';
  priority: 'must' | 'should' | 'could' | 'wont';
  visualReference?: string;
  number: number;
}

interface RequirementsTableProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  language: Language;
}

const statusColors = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'in-review': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
};

const priorityColors = {
  must: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  should: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  could: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  wont: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

export function RequirementsTable({ collapsed, onToggleCollapse, language }: RequirementsTableProps) {
  const t = getTranslations(language);
  const [requirements, setRequirements] = useState<Requirement[]>([
    {
      id: '1',
      number: 1,
      description: 'User must be able to login with email and password',
      status: 'draft',
      category: 'functional',
      priority: 'must'
    },
    {
      id: '2',
      number: 2,
      description: 'System should respond within 2 seconds for all operations',
      status: 'in-review',
      category: 'performance',
      priority: 'should'
    },
    {
      id: '3',
      number: 3,
      description: 'Interface must be accessible on mobile devices',
      status: 'approved',
      category: 'usability',
      priority: 'must'
    }
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Requirement>>({});

  // Filter states
  const [textFilter, setTextFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Filtered requirements
  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      const matchesText = textFilter === "" ||
        req.description.toLowerCase().includes(textFilter.toLowerCase()) ||
        `REQ-${req.number.toString().padStart(3, '0')}`.toLowerCase().includes(textFilter.toLowerCase());

      const matchesStatus = statusFilter === "all" || req.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || req.category === categoryFilter;
      const matchesPriority = priorityFilter === "all" || req.priority === priorityFilter;

      return matchesText && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [requirements, textFilter, statusFilter, categoryFilter, priorityFilter]);

  const startEdit = (requirement: Requirement) => {
    setEditingId(requirement.id);
    setEditForm(requirement);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (!editingId) return;

    setRequirements(prev =>
      prev.map(req =>
        req.id === editingId ? { ...req, ...editForm } : req
      )
    );
    setEditingId(null);
    setEditForm({});
  };

  const deleteRequirement = (id: string) => {
    setRequirements(prev => prev.filter(req => req.id !== id));
  };

  const addRequirement = () => {
    const maxNumber = Math.max(...requirements.map(req => req.number), 0);
    const newRequirement: Requirement = {
      id: Date.now().toString(),
      number: maxNumber + 1,
      description: t.newRequirementDescription,
      status: 'draft',
      category: 'functional',
      priority: 'should'
    };
    setRequirements(prev => [...prev, newRequirement]);
    startEdit(newRequirement);
  };

  const clearFilters = () => {
    setTextFilter("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setPriorityFilter("all");
  };

  const formatRequirementId = (number: number) => {
    return `REQ-${number.toString().padStart(3, '0')}`;
  };

  return (
    <Card className={`rounded-lg bg-card transition-all duration-200 ${collapsed ? "h-auto" : "h-full"}`}>
      {/* Header igual que ChatArea */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-t-lg">
        <span className="font-bold text-lg flex items-center gap-2">
          <TableIcon className="h-5 w-5" />
          {t.requirementsTableTitle}
        </span>
        <div className="flex items-center gap-2">
          <Button onClick={addRequirement} className="gap-2" variant="default" title={t.addRequirement}>
            <Plus className="h-4 w-4" />
            {t.addRequirement}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            title={collapsed ? t.expand : t.collapse}
          >
            {collapsed ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronUp className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Filtros y tabla todo dentro del CardContent */}
      {!collapsed && (
        <CardContent className="p-0">
          {/* Filtros */}
          <div className="px-6 pb-4 pt-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-64">
                <label className="block text-sm mb-2">{t.searchLabel}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t.searchPlaceholder}
                    value={textFilter}
                    onChange={(e) => setTextFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="min-w-32">
                <label className="block text-sm mb-2">{t.statusLabel}</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allStatus}</SelectItem>
                    {Object.entries(t.status as Record<string, string>).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-32">
                <label className="block text-sm mb-2">{t.categoryLabel}</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allCategories}</SelectItem>
                     {Object.entries(t.category as Record<string, string>).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-32">
                <label className="block text-sm mb-2">{t.priorityLabel}</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allPriorities}</SelectItem>
                    {Object.entries(t.priority as Record<string, string>).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                onClick={clearFilters}
                className="gap-2"
                title={t.clearFilters}
              >
                <X className="h-4 w-4" />
                {t.clearFilters}
              </Button>
            </div>

            {/* Filter Summary */}
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              {t.filterSummary.replace('{count}', filteredRequirements.length).replace('{total}', requirements.length)}
              {(textFilter || statusFilter !== "all" || categoryFilter !== "all" || priorityFilter !== "all") && (
                <span className="text-primary">• {t.filtersActive}</span>
              )}
            </div>
          </div>
          <Separator />

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 w-24">{t.headerId}</th>
                  <th className="text-left p-4 w-2/5">{t.headerDescription}</th>
                  <th className="text-left p-4 w-24">{t.headerStatus}</th>
                  <th className="text-left p-4 w-32">{t.headerCategory}</th>
                  <th className="text-left p-4 w-24">{t.headerPriority}</th>
                  <th className="text-left p-4 w-20">{t.headerVisual}</th>
                  <th className="text-left p-4 w-32">{t.headerActions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequirements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      {requirements.length === 0 ? (
                        t.noRequirementsYet
                      ) : (
                        t.noMatchingRequirements
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredRequirements.map((requirement) => (
                    <tr key={requirement.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-mono text-sm font-medium">
                          {formatRequirementId(requirement.number)}
                        </div>
                      </td>
                      <td className="p-4">
                        {editingId === requirement.id ? (
                          <Input
                            value={editForm.description || ''}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="w-full"
                          />
                        ) : (
                          <p>{requirement.description}</p>
                        )}
                      </td>
                      <td className="p-4">
                        {editingId === requirement.id ? (
                          <Select
                            value={editForm.status || requirement.status}
                            onValueChange={(value) => setEditForm({ ...editForm, status: value as Requirement['status'] })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(t.status as Record<string, string>).map(([key, value]) => (
                                <SelectItem key={key} value={key}>{value}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={statusColors[requirement.status]}>
                            {t.status[requirement.status]}
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        {editingId === requirement.id ? (
                          <Select
                            value={editForm.category || requirement.category}
                            onValueChange={(value) => setEditForm({ ...editForm, category: value as Requirement['category'] })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(t.category as Record<string, string>).map(([key, value]) => (
                                <SelectItem key={key} value={key}>{value}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline" className="capitalize">
                            {t.category[requirement.category]}
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        {editingId === requirement.id ? (
                          <Select
                            value={editForm.priority || requirement.priority}
                            onValueChange={(value) => setEditForm({ ...editForm, priority: value as Requirement['priority'] })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(t.priority as Record<string, string>).map(([key, value]) => (
                                <SelectItem key={key} value={key}>{value}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={priorityColors[requirement.priority]}>
                            {t.priority[requirement.priority]}
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <Button variant="outline" size="icon" title={t.viewVisual}>
                          <Image className="h-4 w-4" />
                        </Button>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {editingId === requirement.id ? (
                            <>
                              <Button size="icon" variant="outline" onClick={saveEdit} title={t.saveChanges}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="outline" onClick={cancelEdit} title={t.cancelEdit}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => startEdit(requirement)}
                                title={t.editRequirement}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                title={t.deleteRequirement}
                                onClick={() => deleteRequirement(requirement.id)}
                                className="hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
