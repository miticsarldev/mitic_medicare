"use client";
import { useState } from "react";
import { ArrowUpDown, MoreHorizontal, Pen, Plus, Search, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const medicalServices = [
  { id: 1, name: "Consultation générale", description: "Examen de base et conseils médicaux", price: 50, duration: "30 minutes" },
  { id: 2, name: "Examen de laboratoire", description: "Analyse sanguine et urinaire", price: 80, duration: "1 heure" },
  { id: 3, name: "Radiographie", description: "Imagerie médicale par rayons X", price: 120, duration: "45 minutes" },
  { id: 4, name: "Échographie", description: "Imagerie par ultrasons", price: 150, duration: "1 heure" },
  { id: 5, name: "Consultation spécialisée", description: "Avis d'un spécialiste", price: 100, duration: "45 minutes" },
  { id: 6, name: "Vaccination", description: "Administration de vaccins", price: 30, duration: "20 minutes" },
  { id: 7, name: "Test COVID-19", description: "Test de dépistage du COVID-19", price: 40, duration: "15 minutes" },
  { id: 8, name: "Chirurgie mineure", description: "Petite intervention chirurgicale", price: 200, duration: "2 heures" },
  { id: 9, name: "Physiothérapie", description: "Séances de rééducation physique", price: 60, duration: "1 heure" },
  { id: 10, name: "Consultation pédiatrique", description: "Soins médicaux pour enfants", price: 70, duration: "30 minutes" },
];

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false); 
  const [formData, setFormData] = useState({ name: "", description: "", price: 0, duration: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedMedicalServices, setSelectedMedicalServices] = useState<(typeof medicalServices)[0] | null>(null);
  const [medicalService, setMedicalServices] = useState(medicalServices);

  const filteredServices = medicalServices.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedServices = [...medicalServices]
    .filter((service) =>
      searchQuery === "" || service.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const comparison = a[sortBy] > b[sortBy] ? 1 : -1;
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Pagination
  const totalPages = Math.ceil(sortedServices.length / itemsPerPage);
  const paginatedServices = sortedServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpen = (service: (typeof medicalServices)[0] | null = null) => {
    setSelectedMedicalServices(service);
    if (service) {
      setFormData({ ...service });
    } else {
      setFormData({ name: "", description: "", price: 0, duration: "" });
    }
    setOpen(true);
  };

  const handleSubmit = () => {
    if (selectedMedicalServices) { 
      const updatedServices = medicalServices.map((service) =>
        service.id === selectedMedicalServices.id ? { ...formData, id: service.id } : service
      );
      setMedicalServices(updatedServices);
    } else { 
      const newService = { ...formData, id: Date.now() };
      setMedicalServices([...medicalService, newService]);
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tarification des Services Médicaux</h2>
          <p className="text-muted-foreground">Consultez les tarifs des services disponibles</p>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center space-x-2">
                  <div className="relative flex-1 md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Rechercher un service..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(parseInt(value))}
                  >
                    <SelectTrigger className="h-9 w-[130px]">
                      <SelectValue placeholder="10 par page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 par page</SelectItem>
                      <SelectItem value="10">10 par page</SelectItem>
                      <SelectItem value="20">20 par page</SelectItem>
                      <SelectItem value="50">50 par page</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    className="flex items-center justify-center text-black bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
                    onClick={() => handleOpen()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort("name")}
                        >
                          Service
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Description
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Prix
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Durée
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedServices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6">
                          Aucun service trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedServices.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell>
                            {service.name}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {service.description}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {service.price} XOF
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {service.duration}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpen()}>
                                  <Pen className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600 hover:text-red-900">
                                  <Trash className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Affichage de{" "}
                  {Math.min(
                    filteredServices.length,
                    (currentPage - 1) * itemsPerPage + 1
                  )}{" "}
                  à{" "}
                  {Math.min(
                    filteredServices.length,
                    currentPage * itemsPerPage
                  )}{" "}
                  sur {filteredServices.length} services
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <Button
                          key={pageNumber}
                          variant={
                            pageNumber === currentPage ? "default" : "outline"
                          }
                          size="sm"
                          className="h-8 w-8"
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && <span className="px-2">...</span>}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>{selectedMedicalServices ? "Modifier" : "Ajouter"} un service</DialogTitle>
          <Input name="name" value={formData.name} onChange={handleChange} placeholder="Nom du service" />
          <Input name="description" value={formData.description} onChange={handleChange} placeholder="Description" />
          <Input name="price" value={formData.price} onChange={handleChange} placeholder="Prix" />
          <Input name="duration" value={formData.duration} onChange={handleChange} placeholder="Durée" />
          <Button onClick={handleSubmit}>{selectedMedicalServices ? "Modifier" : "Ajouter"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}