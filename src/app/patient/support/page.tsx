"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import { FileText, PlusCircle, X, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { specialties } from "@/constant";
import { Textarea } from "@/components/ui/textarea";

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState("documents");
  const [showForm, setShowForm] = useState(false);
  const [showForm2, setShowForm2] = useState(false);
  const [file, setFile] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [docName, setDocName] = useState(""); 
  const [patient] = useState("Omar Koita");
  const [selectedCategory, setSelectedCategory] = useState("");
 

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setShowForm(true);
  };
  const handleSubmitNote = () => { 
    console.log("Titre:", noteTitle, "Contenu:", noteContent);
    setShowForm2(true);
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Nom:", docName, "Type:", selectedCategory, "Fichier:", file, "Patient:", patient);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-screen-xl mx-auto">
        <Navbar />
        <div className="mx-auto p-6">
          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              className={`p-3 ${activeTab === "documents" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
              onClick={() => setActiveTab("documents")}
            >
              Documents
            </button>
            <button
              className={`p-3 ${activeTab === "notes" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
              onClick={() => setActiveTab("notes")}
            >
              Notes
            </button>
          </div>

          {/* Content */}
          {activeTab === "documents" ? (
            <div className="text-center">
              <FileText size={48} className="text-blue-500 mx-auto" />
              <h2 className="text-lg font-bold mt-4">Gérez vos documents</h2>
              <p className="text-gray-600">Ajoutez et partagez vos documents facilement.</p>
              <label className="mt-4 inline-block cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600">
                <PlusCircle size={20} className="inline mr-2" /> Ajouter un document
                <Input type="file" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          ) : (
            <div className="text-center">
              <FileText size={48} className="text-blue-500 mx-auto" />
              <h2 className="text-lg font-bold">Notez les informations importantes liées à votre santé</h2>
              <p className="text-gray-600">Vous pouvez suivre des symptômes, noter des inquiétudes liées à votre santé mentale, et préparer des questions pour vos soignants. Vous êtes la seule personne à y avoir accès.</p>
              <label className="mt-4 inline-block cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600">
                <PlusCircle size={20} className="inline mr-2" /> Ajouter une note
                <Input type="file" className="hidden" onChange={handleSubmitNote} />
              </label>
            </div>
          )}

          {/* Form Overlay */}
          {showForm && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg relative">
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowForm(false)}>
                  <X size={24} />
                </button>
                <h2 className="text-lg font-bold mb-4">Ajouter un document</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du document</label>
                    <Input
                      type="text"
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-700 rounded-md shadow-sm"
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type de document</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="dark:bg-gray-700 dark:text-gray-300">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:text-gray-300">
                        {specialties.map((category) => (
                          <SelectItem key={category.value} value={category.value} className="dark:hover:bg-gray-600">
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mb-4 flex items-center text-gray-800 dark:text-gray-200">
                    <User size={20} className="mr-2" />
                    <strong>{patient}</strong>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
                  >
                    Enregistrer
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Note Form Overlay */}
          {showForm2 && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg relative">
                <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowForm2(false)}>
                  <X size={24} />
                </button>
                <h2 className="text-lg font-bold mb-4">Ajouter une note</h2>
                <form onSubmit={handleSubmitNote}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Titre</label>
                    <Input
                      type="text"
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-700 rounded-md shadow-sm"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contenu</label>
                    <Textarea
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-700 rounded-md shadow-sm p-2"
                       
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
                  >
                    Enregistrer
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
