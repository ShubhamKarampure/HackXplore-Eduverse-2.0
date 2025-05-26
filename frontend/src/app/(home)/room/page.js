"use client"

import { useState, useEffect } from "react"
import {
  Search,
  FileText,
  Share2,
  FileCode,
  ChevronDown,
  ChevronUp,
  Eye,
  Plus,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAlert } from "@/context/AlertContext"
import { useRouter } from "next/navigation"
import { getMyDocumentsApi, createDocumentApi } from "@/api/documentApi"
import ShareFeature from "@/components/collab/ShareFeature"

export default function CollabWorkspace() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedType, setSelectedType] = useState(null)
    const [sharingFile, setSharingFile] = useState(null)
    const [sortColumn, setSortColumn] = useState("name")
    const [sortDirection, setSortDirection] = useState("asc")
    const { showAlert, alertTypes } = useAlert();
    const [files, setFiles] = useState([]);
    const [newDocName, setNewDocName] = useState('');
    const [docType, setDocType] = useState('text'); // Default document type
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const router = useRouter();
    
    const fetchDocuments = () => {
        getMyDocumentsApi()
            .then(data => {
                console.log("Fetched documents:", data);
                setFiles(data || []);
            })
            .catch(err => {
                console.error("Failed to fetch files:", err);
                showAlert("Failed to fetch documents", alertTypes.ERROR);
                setFiles([]);
            });
    };
        
    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleCreateDocument = async (e) => {
        e.preventDefault();
        if (!newDocName.trim() || isCreating) return;

        setIsCreating(true);
        try {
            // Pass document type along with the name
            await createDocumentApi(newDocName, docType);
            showAlert("Document created successfully", alertTypes.SUCCESS);
            fetchDocuments(); // Refetch documents after creation
        } catch (err) {
            console.error("Failed to create document:", err);
            showAlert("Failed to create document", alertTypes.ERROR);
            setIsCreating(false);
        }
        finally {
            setIsCreating(false);
            setShowCreateModal(!showCreateModal);
        }
    };

    const toggleCreateModal = () => {
        setShowCreateModal(!showCreateModal);
        setNewDocName('');
        setDocType('text'); // Reset to default type
    };
    
    // Handle sort column change
    const handleSort = (column) => {
        if (sortColumn === column) {
            // Toggle direction if same column
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            // New column, default to ascending
            setSortColumn(column);
            setSortDirection("asc");
        }
    };
    
    
    // Filter files based on search query and selected type
    const filteredFiles = files?.filter((file) => {
        const matchesSearch = file?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType ? file.type === selectedType : true;
        return matchesSearch && matchesType;
    });

    // Sort files
    const sortedFiles = [...(filteredFiles || [])].sort((a, b) => {
        let compareA, compareB;

        switch (sortColumn) {
            case "name":
                compareA = a.name?.toLowerCase() || "";
                compareB = b.name?.toLowerCase() || "";
                break;
            case "type":
                compareA = a.type || "";
                compareB = b.type || "";
                break;
            case "owner":
                compareA = a.ownerId?.firstName?.toLowerCase() || "";
                compareB = b.ownerId?.firstName?.toLowerCase() || "";
                break;
            case "updated":
                compareA = new Date(a.updatedAt).getTime();
                compareB = new Date(b.updatedAt).getTime();
                break;
            default:
                compareA = a.name?.toLowerCase() || "";
                compareB = b.name?.toLowerCase() || "";
        }

        if (sortDirection === "asc") {
            return compareA > compareB ? 1 : -1;
        } else {
            return compareA < compareB ? 1 : -1;
        }
    });

    const handleOpenFile = (file) => {
      router.push(`/room/${file._id}?type=${encodeURIComponent(file.type)}&name=${encodeURIComponent(file.name)}`);
  };
    
    const closeShareDialog = () => {
        setSharingFile(null);
        // Refresh document list to show updated collaborators
        fetchDocuments();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(date);
    };

    const SortIcon = ({ column }) => {
        if (sortColumn !== column) return <ChevronDown className="h-4 w-4 opacity-50" />;
        return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto p-6 max-w-7xl">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Collaborative Workspace</h1>
                        <p className="text-gray-500">Search, edit, and share your files and code files</p>
                    </div>
                    <Button 
                        onClick={toggleCreateModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Create New File
                    </Button>
                </header>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search files..."
                            className="pl-10 border-gray-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Tabs
                        defaultValue="all"
                        className="w-full md:w-auto"
                        onValueChange={(value) => setSelectedType(value === "all" ? null : value)}
                    >
                        <TabsList className="bg-gray-100">
                            <TabsTrigger value="all" className="data-[state=active]:bg-white">
                                All Files
                            </TabsTrigger>
                            <TabsTrigger value="text" className="data-[state=active]:bg-white">
                                Text
                            </TabsTrigger>
                            <TabsTrigger value="code" className="data-[state=active]:bg-white">
                                Code
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Files Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%] cursor-pointer" onClick={() => handleSort("name")}>
                                    <div className="flex items-center">
                                        File Name
                                        <SortIcon column="name" />
                                    </div>
                                </TableHead>
                                <TableHead className="w-[15%] cursor-pointer" onClick={() => handleSort("type")}>
                                    <div className="flex items-center">
                                        Type
                                        <SortIcon column="type" />
                                    </div>
                                </TableHead>
                                <TableHead className="w-[15%] cursor-pointer" onClick={() => handleSort("owner")}>
                                    <div className="flex items-center">
                                        Owner
                                        <SortIcon column="owner" />
                                    </div>
                                </TableHead>
                                <TableHead className="w-[20%] cursor-pointer" onClick={() => handleSort("updated")}>
                                    <div className="flex items-center">
                                        Last Updated
                                        <SortIcon column="updated" />
                                    </div>
                                </TableHead>
                                <TableHead className="w-[10%] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedFiles.map((file) => (
                                <TableRow
                                    key={file._id}
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleOpenFile(file)}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className={`p-2 rounded-md ${
                                                    file.type === "text" ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500"
                                                }`}
                                            >
                                                {file.type === "text" ? <FileText size={20} /> : <FileCode size={20} />}
                                            </div>
                                            <span className="truncate max-w-[250px]">{file.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`${
                                                file.type === "text" ? "border-blue-200 text-blue-600" : "border-purple-200 text-purple-600"
                                            }`}
                                        >
                                            {file.type === "text" ? "Document" : file.language || "Code"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={file?.ownerId?.profile?.image?.url} />
                                                <AvatarFallback>
                                                    {file?.ownerId?.firstName ? file.ownerId.firstName.substring(0, 2) : "??"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{file?.ownerId?.firstName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-gray-500">{formatDate(file.updatedAt)}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                                    <span className="sr-only">Open menu</span>
                                                    <ChevronDown className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenFile(file);
                                                    }}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Open
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSharingFile(file);
                                                    }}
                                                >
                                                    <Share2 className="mr-2 h-4 w-4" />
                                                    Share
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Empty state */}
                    {sortedFiles.length === 0 && (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <Search className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No files found</h3>
                            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                        </div>
                    )}
                </div>

                {/* Sharing Dialog */}
                {sharingFile && (
                    <ShareFeature
                        documentId={sharingFile._id}
                        onClose={closeShareDialog}
                    />
                )}

                {/* Create File Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100 p-4">
                        <div className="bg-white rounded-lg w-full max-w-md p-6">
                            <h2 className="text-xl font-semibold mb-4">Create New File</h2>
                            <form onSubmit={handleCreateDocument}>
                                <div className="mb-4">
                                    <label htmlFor="fileName" className="block text-sm font-medium text-gray-700 mb-1">
                                        File Name
                                    </label>
                                    <Input
                                        id="fileName"
                                        type="text"
                                        placeholder="Enter file name"
                                        value={newDocName}
                                        onChange={(e) => setNewDocName(e.target.value)}
                                        className="w-full"
                                        autoFocus
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        File Type
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="docType"
                                                value="text"
                                                checked={docType === "text"}
                                                onChange={() => setDocType("text")}
                                                className="mr-2"
                                            />
                                            <FileText className="mr-1 h-4 w-4 text-blue-500" />
                                            Document
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="docType"
                                                value="code"
                                                checked={docType === "code"}
                                                onChange={() => setDocType("code")}
                                                className="mr-2"
                                            />
                                            <FileCode className="mr-1 h-4 w-4 text-purple-500" />
                                            Code
                                        </label>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={toggleCreateModal}
                                        disabled={isCreating}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={!newDocName.trim() || isCreating}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {isCreating ? "Creating..." : "Create"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}