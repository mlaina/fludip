"use client"

import type React from "react"
import { Waves, MessageCircle, ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import LanguageSelector from "@/components/LanguageSelector"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type ResponseData = {
    large: string
    shorts: string[]
}

export default function Home() {
    const t = useTranslations()
    const [formSubmitted, setFormSubmitted] = useState(false)
    const [userName, setUserName] = useState("")
    const [userThought, setUserThought] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [responses, setResponses] = useState<ResponseData[]>([])
    const [currentResponseIndex, setCurrentResponseIndex] = useState(0)

    // Función para enviar el pensamiento del usuario
    const submitThought = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!userName.trim() || !userThought.trim() || isLoading) return

        setIsLoading(true)

        try {
            const response = await fetch("/api/lisa", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: userName,
                    text: userThought,
                }),
            })

            if (!response.ok) {
                throw new Error("Error al procesar la solicitud")
            }

            const data = (await response.json()) as ResponseData
            setResponses([data])
            setCurrentResponseIndex(0)
            setFormSubmitted(true)
        } catch (error) {
            console.error("Error:", error)
            alert("Ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo.")
        } finally {
            setIsLoading(false)
        }
    }

    // Función para obtener la siguiente respuesta
    const getNextResponse = async () => {
        if (isLoading) return

        setIsLoading(true)

        try {
            const response = await fetch("/api/lisa", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: userName,
                    text: userThought,
                }),
            })

            if (!response.ok) {
                throw new Error("Error al procesar la solicitud")
            }

            const data = (await response.json()) as ResponseData
            setResponses((prev) => [...prev, data])
            setCurrentResponseIndex((prev) => prev + 1)
        } catch (error) {
            console.error("Error:", error)
            alert("Ha ocurrido un error al obtener la siguiente respuesta. Por favor, inténtalo de nuevo.")
        } finally {
            setIsLoading(false)
        }
    }

    // Función para ir a la respuesta anterior
    const goToPreviousResponse = () => {
        if (currentResponseIndex > 0) {
            setCurrentResponseIndex((prev) => prev - 1)
        }
    }

    // Obtener la respuesta actual
    const currentResponse = responses[currentResponseIndex]

    return (
        <div className="relative min-h-screen overflow-hidden bg-white">
            <header id="top" className="container mx-auto max-w-6xl md:py-4 pt-6 px-8">
                <nav className="flex justify-between items-center">
                    <Link href="/" className="text-3xl font-bold text-gray-800 flex items-center">
                        <Waves className="w-10 h-10 mr-2 text-secondary-900" />
                        <p className="text-secondary-900 text-4xl font-bold">Fludip</p>
                    </Link>
                    <div className="hidden md:flex space-x-8 text-md">
                        <LanguageSelector />
                    </div>
                </nav>
            </header>
            <main className="bg-cover bg-center min-h-screen">
                <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-secondary-50 to-pink-50 p-4">
                    {!formSubmitted ? (
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-md text-center p-6">
                            <h1 className="text-2xl font-bold text-secondary-800 mb-4">¿Qué estás pensando hoy?</h1>
                            <div className="flex justify-center mb-4">
                                <div className="bg-secondary-100 p-6 rounded-full">
                                    <MessageCircle size={48} className="text-secondary-600" />
                                </div>
                            </div>
                            <p className="text-gray-600 mb-6">Cuéntanos qué te interesa o te apetece comentar hoy.</p>

                            <form onSubmit={submitThought} className="space-y-4 mb-6">
                                <div className="text-left">
                                    <Label htmlFor="name" className="text-sm font-medium">
                                        Tu nombre
                                    </Label>
                                    <Input
                                        id="name"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        placeholder="Introduce tu nombre"
                                        className="mt-1"
                                        required
                                    />
                                </div>

                                <div className="text-left">
                                    <Label htmlFor="thought" className="text-sm font-medium">
                                        ¿Qué estás pensando hoy? ¿Qué te interesa o te apetece comentar?
                                    </Label>
                                    <Textarea
                                        id="thought"
                                        value={userThought}
                                        onChange={(e) => setUserThought(e.target.value)}
                                        placeholder="Comparte tus pensamientos..."
                                        className="mt-1 min-h-[120px]"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={!userName.trim() || !userThought.trim() || isLoading}
                                    className="w-full bg-secondary-600 hover:bg-secondary-700 text-white px-8 py-4 rounded-full text-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Procesando..." : "Enviar"}
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="w-full max-w-2xl">
                            {currentResponse && (
                                <Card className="shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-xl text-secondary-800">Hola, {userName}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="bg-secondary-50 p-4 rounded-lg">
                                            <p className="text-lg font-medium text-secondary-800">{currentResponse.large}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {currentResponse.shorts.map((short, index) => (
                                                <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                                    <p className="text-gray-700">{short}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between">
                                        <Button
                                            variant="outline"
                                            onClick={goToPreviousResponse}
                                            disabled={currentResponseIndex === 0}
                                            className="flex items-center gap-2"
                                        >
                                            <ArrowLeft size={16} />
                                            Anterior
                                        </Button>

                                        <div className="text-sm text-gray-500">
                                            {currentResponseIndex + 1} de {responses.length}
                                        </div>

                                        <Button
                                            onClick={getNextResponse}
                                            disabled={isLoading}
                                            className="bg-secondary-600 hover:bg-secondary-700 text-white flex items-center gap-2"
                                        >
                                            {isLoading ? "Cargando..." : "Siguiente"}
                                            {!isLoading && <ArrowRight size={16} />}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )}

                            <div className="mt-4 text-center">
                                <p className="text-gray-500 mb-2">Tu pensamiento:</p>
                                <div className="bg-white p-3 rounded-md border border-gray-200 text-left">
                                    <p className="text-gray-700">{userThought}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="bg-secondary-700 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">{t("app_name")}</h3>
                            <p className="text-sm ">{t("creating_magical_stories")}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">{t("follow_us")}</h3>
                            <div className="flex space-x-4">
                                <a href="#" className=" hover:text-white">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path
                                            fillRule="evenodd"
                                            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                                <a href="#" className=" hover:text-white">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path
                                            fillRule="evenodd"
                                            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                                <a href="#" className=" hover:text-white">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white text-center">
                        <p className="text-sm ">&copy; 2025 Fludip. {t("all_rights_reserved")}</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
