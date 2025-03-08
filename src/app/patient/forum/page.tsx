"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { Search } from "lucide-react";
import {
  posts,
  specialities,
  recentArticles,
  medicalArticles,
} from "@/constant";
import ForumPost from "@/components/doctor-section";
import Image from "next/image";
import { useState } from "react";

export default function ForumPage() {
  const [selectedPost, setSelectedPost] = useState<null | (typeof posts)[0]>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<
    null | (typeof recentArticles)[0] | (typeof medicalArticles)[0]
  >(null);

  // Filtrer les posts en fonction de la catégorie sélectionnée
  const filteredPosts = selectedCategory
    ? posts.filter((post) => post.category === selectedCategory)
    : posts;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-100/50 dark:from-background dark:to-blue-950/50">
      <div className="max-w-screen-xl mx-auto">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Forum Banner */}
          <div className="relative w-full h-64 mb-6">
            <Image
              src="/montre.png"
              alt="Forum Banner"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <h1 className="text-3xl font-bold text-white">
                Bienvenue sur le Forum
              </h1>
            </div>
          </div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Forum
            </h1>
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Rechercher..."
                className="w-full p-2 pr-12 border rounded-md"
              />
              <Button className="absolute inset-y-0 right-0 flex items-center justify-center w-10 h-full bg-yellow-500 rounded-md hover:bg-yellow-600">
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>
          {/* Filter & Search Bar */}
          <div className="flex justify-cente items-center mb-6">
            <div className="flex space-x-4 overflow-x-auto">
              {specialities.map((category, index) => (
                <Button
                  key={index}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-md border text-blue-600 ${
                    selectedCategory === category.value
                      ? "bg-yellow-500 text-white"
                      : "bg-white dark:bg-gray-800 dark:text-white"
                  }`}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Forum Posts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <ForumPost
                key={index}
                post={post}
                onSelect={() => setSelectedPost(post)}
              />
            ))}
          </div>
          {/* Post Modal */}
          {selectedPost && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-3/4 md:w-1/2 shadow-lg relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                  onClick={() => setSelectedPost(null)}
                >
                  ✖
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedPost.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedPost.content}
                </p>
              </div>
            </div>
          )}
          {/* Articles Section */}
          <section className="mt-12">
            {/* Articles récents */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Articles récents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {recentArticles.map((article, index) => (
                <div
                  key={index}
                  className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer"
                  onClick={() => setSelectedArticle(article)}
                >
                  <Image
                    src={article.image}
                    alt={article.title}
                    width={300}
                    height={200}
                    className="w-full h-40 object-cover"
                  />
                  <p className="absolute bottom-2 left-2 bg-yellow-500 text-white px-2 py-1 text-sm font-semibold rounded">
                    {article.category}
                  </p>
                  <h3 className="p-4 text-sm font-medium">{article.title}</h3>
                </div>
              ))}
            </div>
            {/* Articles médicaux */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
              Articles médicaux
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {medicalArticles.map((article, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer"
                  onClick={() => setSelectedArticle(article)}
                >
                  <Image
                    src={article.image}
                    alt={article.title}
                    width={300}
                    height={200}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-sm font-medium">
                      {article.title.slice(0, 80)}...
                    </h3>
                    <div className="flex items-center mt-2">
                      <Image
                        src={article.authorImage}
                        alt={article.author}
                        width={30}
                        height={30}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="ml-2">
                        <p className="text-sm font-semibold text-blue-600">
                          {article.author}
                        </p>
                        <p className="text-xs text-gray-500">
                          {article.specialty}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Modal d'affichage de l'article sélectionné */}
            {selectedArticle && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-3/4 md:w-1/2 shadow-lg relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                    onClick={() => setSelectedArticle(null)}
                  >
                    ✖
                  </button>

                  <Image
                    src={selectedArticle.image}
                    alt={selectedArticle.title}
                    width={500}
                    height={300}
                    className="w-full h-60 object-cover"
                  />

                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-4">
                    {selectedArticle.title}
                  </h2>

                  {/* Vérifier si c'est un article récent (avec catégorie) */}
                  {"category" in selectedArticle && (
                    <p className="text-sm font-semibold text-yellow-500">
                      {selectedArticle.category}
                    </p>
                  )}

                  {/* Vérifier si c'est un article médical (avec auteur) */}
                  {"author" in selectedArticle && (
                    <div className="mt-4 flex items-center">
                      <Image
                        src={selectedArticle.authorImage}
                        alt={selectedArticle.author}
                        width={30}
                        height={30}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="ml-2">
                        <p className="text-sm font-semibold text-blue-600">
                          {selectedArticle.author}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedArticle.specialty}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
