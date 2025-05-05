import { useState } from "react";
import useFetchData from "../../../utils/hooks/useFetchData";

interface Diskusi {
  _id?: string;
  title: string;
  description: string;
  link?: string;
}

export default function DiskusiModal() {
  const {
    dataLain: dataDiskusi,
    error,
    loading,
    mutate,
  } = useFetchData("diskusi");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false); // State untuk modal konfirmasi simpan
  const [modalType, setModalType] = useState<"add" | "edit" | null>(null);
  const [currentData, setCurrentData] = useState<Diskusi | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openModal = (type: "add" | "edit", data?: Diskusi) => {
    setModalType(type);
    setCurrentData(data || { title: "", description: "", link: "" });
    setIsModalOpen(true);
    setErrorMessage(null); // Reset error saat buka modal
  };

  const closeModal = () => {
    setModalType(null);
    setCurrentData(null);
    setIsModalOpen(false);
    setErrorMessage(null); // Reset error saat tutup modal
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteId(null);
    setIsDeleteConfirmOpen(false);
  };

  const openSaveConfirm = () => {
    setIsConfirmSaveOpen(true); // Buka modal konfirmasi sebelum simpan
  };

  const closeSaveConfirm = () => {
    setIsConfirmSaveOpen(false); // Tutup modal konfirmasi
  };

  const generateLinkFromTitle = (title: string): string => {
    return `/diskusi/${title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\s-]/g, "")}`;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedTitle = e.target.value;
    setCurrentData((prevData) => ({
      ...prevData!,
      title: updatedTitle,
      link: generateLinkFromTitle(updatedTitle),
    }));
  };

  const handleSave = async (data: Diskusi) => {
    // Validasi
    if (!data.title || !data.description) {
      setErrorMessage("Title dan Description harus diisi.");
      return;
    }

    if (!data.link) {
      data.link = generateLinkFromTitle(data.title);
    }

    const url = data._id
      ? `/api/admin?data=diskusi&id=${data._id}`
      : `/api/admin?data=diskusi`;
    const method = data._id ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || "Failed to save data");
      }

      await mutate();
      closeSaveConfirm(); // Tutup modal konfirmasi setelah simpan
      closeModal();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin?data=diskusi&id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || "Failed to delete data");
      }

      await mutate();
      closeDeleteConfirm();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center my-40">
        <div className="border-t-4 border-blue-500 border-solid w-8 h-8 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center text-red-500">
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold">Oops, something went wrong!</p>
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Kontrol Diskusi
      </h2>
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex-grow">
          <section className="py-16 flex flex-col items-center justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataDiskusi?.map((item: Diskusi) => (
                <div
                  key={item?._id}
                  className="bg-white shadow-md rounded-lg overflow-hidden transform transition-all duration-300 ease-in-out scale-100 hover:scale-105"
                >
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                      {item.title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-4 truncate">
                      {item.description}
                    </p>
                    <div className="flex justify-between">
                      <button
                        onClick={() => openModal("edit", item)}
                        className="text-sm bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(item._id!)}
                        className="text-sm bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <div className="absolute bottom-6 right-6">
        <button
          onClick={() => openModal("add")}
          className="bg-blue-600 text-white px-6 py-2 text-sm rounded-md shadow transition duration-200"
        >
          Tambah Data
        </button>
      </div>

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 w-full max-w-sm rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-center mb-4">
              Konfirmasi Hapus
            </h2>
            <p className="text-center text-gray-700 mb-6">
              Apakah Anda yakin ingin menghapus diskusi ini?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleDelete(deleteId!)}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              >
                Hapus
              </button>
              <button
                onClick={closeDeleteConfirm}
                className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 w-full max-w-md rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-center mb-4">
              {modalType === "add" ? "Tambah Diskusi" : "Edit Diskusi"}
            </h2>
            {errorMessage && (
              <div className="mb-4 text-red-500 text-sm text-center">
                {errorMessage}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                openSaveConfirm(); // Buka modal konfirmasi sebelum simpan
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Diskusi
                </label>
                <input
                  type="text"
                  value={currentData?.title || ""}
                  onChange={handleTitleChange}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={currentData?.description || ""}
                  onChange={(e) =>
                    setCurrentData((prevData) => ({
                      ...prevData!,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  {modalType === "add" ? "Tambah" : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isConfirmSaveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 w-full max-w-sm rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-center mb-4">
              Konfirmasi Simpan
            </h2>
            <p className="text-center text-gray-700 mb-6">
              Apakah Anda yakin ingin menyimpan perubahan ini?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleSave(currentData!)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                Simpan
              </button>
              <button
                onClick={closeSaveConfirm}
                className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
