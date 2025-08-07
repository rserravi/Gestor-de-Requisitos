import { useState, useMemo } from "react";
import {
  Box, Paper, Stack, Typography, IconButton, Button, Divider,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Select, MenuItem, TextField, Chip, Collapse
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  ExpandLess,
  ExpandMore,
  List as TableIcon
} from "@mui/icons-material";
import { getTranslations, type Language } from "../i18n";
import type { RequirementModel } from "../models/requeriment-model";
import { requirementsMock } from "../mock/requirements-mock";

interface RequirementsTableProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  language: Language;
  projectId: number; 
  ownerId: number;
}

const statusColors: Record<RequirementModel['status'], 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  draft: "warning",
  approved: "success",
  rejected: "error",
  "in-review": "info"
};

const priorityColors: Record<RequirementModel['priority'], 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  must: "error",
  should: "warning",
  could: "info",
  wont: "default"
};

export function RequirementsTable({ collapsed, onToggleCollapse, language, projectId, ownerId }: RequirementsTableProps) {
  const t = getTranslations(language);
  const [requirements, setRequirements] = useState<RequirementModel[]>(requirementsMock as RequirementModel[]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<RequirementModel>>({});

  // Filtros
  const [textFilter, setTextFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Filtrado de requisitos
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

  // Acciones de edición
  const startEdit = (requirement: RequirementModel) => {
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
    const newRequirement: RequirementModel = {
      id: Date.now().toString(),
      number: maxNumber + 1,
      description: t.newRequirementDescription,
      status: 'draft',
      category: 'functional',
      priority: 'should',
      visualReference: '',
      projectId: projectId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: ownerId
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
    <Paper elevation={3} sx={{ borderRadius: 2, p: 0, mb: 1, display: "flex", flexDirection: "column", height: collapsed ? "auto" : "100%" }}>
      {/* Header igual que ChatArea */}
      <Box display="flex" alignItems="center" justifyContent="space-between" px={2} py={1.5} sx={{
        bgcolor: "background.paper",
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottom: 1,
        borderColor: "divider"
      }}>
        <Typography fontWeight="bold" variant="subtitle1" display="flex" alignItems="center" gap={1.5}>
          <TableIcon fontSize="small" />
          {t.requirementsTableTitle}
        </Typography>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
            onClick={addRequirement}
          >
            {t.addRequirement}
          </Button>
          <IconButton onClick={onToggleCollapse} size="small" title={collapsed ? t.expand : t.collapse}>
            {collapsed ? <ExpandMore /> : <ExpandLess />}
          </IconButton>
        </Box>
      </Box>

      {/* Collapse de tabla */}
      <Collapse in={!collapsed} timeout="auto" unmountOnExit>
        {/* Área de filtros compacta */}
        <Box px={3} pt={2} pb={0}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems="flex-end"
            flexWrap="wrap"
            useFlexGap
          >
            <TextField
              placeholder={t.searchPlaceholder}
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} fontSize="small" />,
              }}
              sx={{ minWidth: 140, maxWidth: 180 }}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
              displayEmpty
              sx={{ minWidth: 110 }}
            >
              <MenuItem value="all">{t.allStatus}</MenuItem>
              {Object.entries(t.status as Record<string, string>).map(([key, value]) => (
                <MenuItem key={key} value={key}>{value}</MenuItem>
              ))}
            </Select>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              size="small"
              displayEmpty
              sx={{ minWidth: 110 }}
            >
              <MenuItem value="all">{t.allCategories}</MenuItem>
              {Object.entries(t.category as Record<string, string>).map(([key, value]) => (
                <MenuItem key={key} value={key}>{value}</MenuItem>
              ))}
            </Select>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              size="small"
              displayEmpty
              sx={{ minWidth: 110 }}
            >
              <MenuItem value="all">{t.allPriorities}</MenuItem>
              {Object.entries(t.priority as Record<string, string>).map(([key, value]) => (
                <MenuItem key={key} value={key}>{value}</MenuItem>
              ))}
            </Select>
            <Button
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={clearFilters}
              size="small"
              sx={{ minWidth: 36 }}
            >
              {t.clearFilters}
            </Button>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: "auto", minWidth: 120 }}>
              <FilterIcon fontSize="small" sx={{ color: "text.secondary" }} />
              <Typography variant="caption">
                {t.filterSummary.replace('{count}', filteredRequirements.length).replace('{total}', requirements.length)}
              </Typography>
              {(textFilter || statusFilter !== "all" || categoryFilter !== "all" || priorityFilter !== "all") && (
                <Typography variant="caption" color="primary" fontWeight={500}>• {t.filtersActive}</Typography>
              )}
            </Stack>
          </Stack>
        </Box>
        <Divider sx={{ mt: 1, mb: 1 }} />

        {/* Tabla */}
        <TableContainer sx={{ maxHeight: 420, minHeight: 140 }}>
          <Table stickyHeader size="small" sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>{t.headerId}</TableCell>
                <TableCell>{t.headerDescription}</TableCell>
                <TableCell>{t.headerStatus}</TableCell>
                <TableCell>{t.headerCategory}</TableCell>
                <TableCell>{t.headerPriority}</TableCell>
                <TableCell>{t.headerVisual}</TableCell>
                <TableCell>{t.headerActions}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequirements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {requirements.length === 0
                      ? t.noRequirementsYet
                      : t.noMatchingRequirements}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequirements.map((requirement) => (
                  <TableRow key={requirement.id} hover>
                    <TableCell>
                      <Typography fontFamily="monospace" fontWeight={500}>
                        {formatRequirementId(requirement.number)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {editingId === requirement.id ? (
                        <TextField
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          size="small"
                          fullWidth
                        />
                      ) : (
                        <Typography>{requirement.description}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === requirement.id ? (
                        <Select
                          value={editForm.status || requirement.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value as RequirementModel['status'] })}
                          size="small"
                          fullWidth
                        >
                          {Object.entries(t.status as Record<string, string>).map(([key, value]) => (
                            <MenuItem key={key} value={key}>{value}</MenuItem>
                          ))}
                        </Select>
                      ) : (
                        <Chip
                          label={t.status[requirement.status]}
                          color={statusColors[requirement.status]}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === requirement.id ? (
                        <Select
                          value={editForm.category || requirement.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value as RequirementModel['category'] })}
                          size="small"
                          fullWidth
                        >
                          {Object.entries(t.category as Record<string, string>).map(([key, value]) => (
                            <MenuItem key={key} value={key}>{value}</MenuItem>
                          ))}
                        </Select>
                      ) : (
                        <Chip
                          label={t.category[requirement.category]}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === requirement.id ? (
                        <Select
                          value={editForm.priority || requirement.priority}
                          onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as RequirementModel['priority'] })}
                          size="small"
                          fullWidth
                        >
                          {Object.entries(t.priority as Record<string, string>).map(([key, value]) => (
                            <MenuItem key={key} value={key}>{value}</MenuItem>
                          ))}
                        </Select>
                      ) : (
                        <Chip
                          label={t.priority[requirement.priority]}
                          color={priorityColors[requirement.priority]}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton color="default" size="small" title={t.viewVisual}>
                        <ImageIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {editingId === requirement.id ? (
                          <>
                            <IconButton color="primary" size="small" onClick={saveEdit} title={t.saveChanges}>
                              <SaveIcon fontSize="small" />
                            </IconButton>
                            <IconButton color="default" size="small" onClick={cancelEdit} title={t.cancelEdit}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton color="primary" size="small" onClick={() => startEdit(requirement)} title={t.editRequirement}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              title={t.deleteRequirement}
                              onClick={() => deleteRequirement(requirement.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </Paper>
  );
}
