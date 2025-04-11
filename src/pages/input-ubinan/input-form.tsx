
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CheckCircle2, Loader2, Save } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { getPPLAllocations } from "@/services/allocation-service";

const formSchema = z.object({
  allocationType: z.enum(["nks", "segmen"]),
  allocationId: z.string().min(1, "Pilih alokasi terlebih dahulu"),
  respondenName: z.string().min(3, "Nama responden minimal 3 karakter"),
  sampleStatus: z.enum(["Utama", "Cadangan"]),
  komoditas: z.string().min(1, "Pilih komoditas terlebih dahulu"),
  tanggalUbinan: z.date(),
  beratHasil: z.number().min(0.1, "Berat hasil harus lebih dari 0")
});

type FormValues = z.infer<typeof formSchema>;

export function InputUbinanForm() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nksAllocations, setNksAllocations] = useState([]);
  const [segmenAllocations, setSegmenAllocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTipe, setSelectedTipe] = useState("nks");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      allocationType: "nks",
      allocationId: "",
      respondenName: "",
      sampleStatus: "Utama",
      komoditas: "",
      beratHasil: 0,
    }
  });

  const komoditasOptions = [
    { value: "padi", label: "Padi" },
    { value: "jagung", label: "Jagung" },
    { value: "kedelai", label: "Kedelai" },
    { value: "kacang_tanah", label: "Kacang Tanah" },
    { value: "ubi_kayu", label: "Ubi Kayu" },
    { value: "ubi_jalar", label: "Ubi Jalar" }
  ];
  
  const fetchAllocations = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const allocations = await getPPLAllocations(user.id);
      
      setNksAllocations(allocations.nks || []);
      setSegmenAllocations(allocations.segmen || []);
    } catch (error) {
      console.error("Error fetching allocations:", error);
      toast.error("Gagal mengambil data alokasi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, [user]);
  
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error("Anda harus login terlebih dahulu");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get PML ID based on allocation type and ID
      let pmlId = null;
      if (values.allocationType === "nks") {
        const nksItem = nksAllocations.find(item => item.nks?.id === values.allocationId);
        pmlId = nksItem?.pml?.id;
      } else {
        const segmenItem = segmenAllocations.find(item => item.segmen?.id === values.allocationId);
        pmlId = segmenItem?.pml?.id;
      }
      
      if (!pmlId) {
        toast.error("Data PML tidak ditemukan");
        return;
      }
      
      // Prepare data for insertion
      const insertData = {
        nks_id: values.allocationType === "nks" ? values.allocationId : null,
        segmen_id: values.allocationType === "segmen" ? values.allocationId : null,
        responden_name: values.respondenName,
        sample_status: values.sampleStatus,
        komoditas: values.komoditas,
        tanggal_ubinan: format(values.tanggalUbinan, 'yyyy-MM-dd'),
        berat_hasil: values.beratHasil,
        ppl_id: user.id,
        pml_id: pmlId,
        status: 'sudah_diisi',
        dokumen_diterima: false
      };
      
      const { data, error } = await supabase
        .from('ubinan_data')
        .insert(insertData)
        .select();
      
      if (error) {
        console.error("Error submitting data:", error);
        toast.error("Gagal menyimpan data");
        return;
      }
      
      toast.success("Data berhasil disimpan");
      form.reset({
        allocationType: "nks",
        allocationId: "",
        respondenName: "",
        sampleStatus: "Utama",
        komoditas: "",
        tanggalUbinan: undefined,
        beratHasil: 0
      });
      
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAllocationTypeChange = (value: string) => {
    setSelectedTipe(value);
    form.setValue("allocationType", value as "nks" | "segmen");
    form.setValue("allocationId", "");
    
    // If changing allocation type to segmen, only allow padi as komoditas
    if (value === "segmen") {
      form.setValue("komoditas", "padi");
    } else {
      form.setValue("komoditas", "");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Input Data Ubinan</CardTitle>
        <CardDescription>
          Isi form berikut untuk menambahkan data ubinan baru
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs 
              value={selectedTipe} 
              onValueChange={handleAllocationTypeChange} 
              className="w-full"
            >
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="nks">NKS (Palawija)</TabsTrigger>
                <TabsTrigger value="segmen">Segmen (Padi)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="nks" className="pt-4">
                <FormField
                  control={form.control}
                  name="allocationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilih NKS</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih NKS" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {nksAllocations.length === 0 ? (
                            <SelectItem value="no-data" disabled>
                              Tidak ada NKS yang tersedia
                            </SelectItem>
                          ) : (
                            nksAllocations.map((item) => (
                              <SelectItem key={item.nks?.id} value={item.nks?.id}>
                                {item.nks?.code} - {item.nks?.desa?.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="segmen" className="pt-4">
                <FormField
                  control={form.control}
                  name="allocationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilih Segmen</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Segmen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {segmenAllocations.length === 0 ? (
                            <SelectItem value="no-data" disabled>
                              Tidak ada Segmen yang tersedia
                            </SelectItem>
                          ) : (
                            segmenAllocations.map((item) => (
                              <SelectItem key={item.segmen?.id} value={item.segmen?.id}>
                                {item.segmen?.code} - {item.segmen?.desa?.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="respondenName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Responden</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama responden" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sampleStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Sampel</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status sampel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Utama">Utama</SelectItem>
                        <SelectItem value="Cadangan">Cadangan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="komoditas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Komoditas</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={selectedTipe === "segmen"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih komoditas" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {komoditasOptions
                          .filter(option => selectedTipe === "segmen" ? option.value === "padi" : true)
                          .map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tanggalUbinan"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Ubinan</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                          >
                            {field.value ? (
                              format(field.value, "dd MMMM yyyy")
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("2020-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="beratHasil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Berat Hasil (kg)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="Masukkan berat hasil dalam kg" 
                      {...field} 
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Data
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between flex-wrap">
        <p className="text-sm text-muted-foreground">
          Pastikan data yang dimasukkan sudah benar
        </p>
        {selectedTipe === "nks" ? (
          <p className="text-sm font-medium flex items-center">
            <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />
            NKS: Palawija
          </p>
        ) : (
          <p className="text-sm font-medium flex items-center">
            <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />
            Segmen: Padi
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
