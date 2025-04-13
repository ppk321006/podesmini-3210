
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username harus diisi",
  }),
  password: z.string().min(1, {
    message: "Password harus diisi",
  }),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError("");

    try {
      await login(values.username, values.password);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setError("Username atau password salah");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 flex flex-col items-center justify-center p-6">
          <div className="w-full flex items-center justify-center">
            <img 
              src="/lovable-uploads/afc24a8c-b786-403d-a9a3-8587217ee595.png" 
              alt="Sistem Informasi Monitoring Tanaman Pangan Palawija" 
              className="w-full max-w-[280px] md:max-w-[320px] h-auto object-contain" 
            />
          </div>
          <div className="space-y-2 text-center mt-4">
            <h1 className="text-2xl font-bold">Selamat Datang</h1>
            <p className="text-sm text-muted-foreground">
              Silahkan login untuk melanjutkan
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Masukkan password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="text-sm font-medium text-destructive">{error}</div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="border-t p-4">
          <div className="text-xs text-center w-full text-muted-foreground">
            © {new Date().getFullYear()} BPS Kabupaten Majalengka
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
