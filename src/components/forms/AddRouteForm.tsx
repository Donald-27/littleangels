import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { api } from "@/convex/_generated/api";

const stopSchema = z.object({
  name: z.string().min(1, "Stop name is required"),
  lat: z.number(),
  lng: z.number(),
  time: z.string().min(1, "Time is required"),
  studentsCount: z.number().min(0)
});

const routeSchema = z.object({
  name: z.string().min(1, "Route name is required"),
  description: z.string().min(1, "Description is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  stops: z.array(stopSchema).min(2, "At least 2 stops are required"),
  distanceKm: z.number().min(0.1, "Distance must be greater than 0"),
  estimatedDurationMinutes: z.number().min(1, "Duration must be at least 1 minute"),
  color: z.string().min(1, "Color is required"),
  morningStartTime: z.string().min(1, "Morning start time is required"),
  eveningStartTime: z.string().min(1, "Evening start time is required")
});

type RouteFormData = z.infer<typeof routeSchema>;

interface AddRouteFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddRouteForm({ onSuccess, onCancel }: AddRouteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const branches = useQuery(api.admin.getBranches);
  const vehicles = useQuery(api.admin.getVehicles);
  const addRoute = useMutation(api.admin.addRoute);

  const form = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      stops: [
        { name: "", lat: 0, lng: 0, time: "", studentsCount: 0 },
        { name: "", lat: 0, lng: 0, time: "", studentsCount: 0 }
      ],
      distanceKm: 0,
      estimatedDurationMinutes: 60,
      color: "#3B82F6"
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stops"
  });

  const onSubmit = async (data: RouteFormData) => {
    setIsSubmitting(true);
    try {
      const branchId = branches?.[0]?._id;
      if (!branchId) {
        toast.error("No branch available. Please contact administrator.");
        return;
      }

      const result = await addRoute({
        name: data.name,
        description: data.description,
        branchId,
        vehicleId: data.vehicleId as any,
        stops: data.stops.map(stop => ({
          name: stop.name,
          coordinates: { lat: stop.lat, lng: stop.lng },
          time: stop.time,
          students_count: stop.studentsCount
        })),
        distanceKm: data.distanceKm,
        estimatedDurationMinutes: data.estimatedDurationMinutes,
        color: data.color,
        morningStartTime: data.morningStartTime,
        eveningStartTime: data.eveningStartTime
      });

      if (result.success) {
        toast.success(`Route ${data.name} added successfully!`);
        form.reset();
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error adding route:", error);
      toast.error("Failed to add route. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!branches || !vehicles) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Route</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Route 1 - Pioneer Estate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Vehicle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicles?.map((vehicle) => (
                          <SelectItem key={vehicle._id} value={vehicle._id}>
                            {vehicle.registration} - {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Route covering Pioneer Estate and surrounding areas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="distanceKm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distance (km)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="18.5" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedDurationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="65" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route Color</FormLabel>
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="morningStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Morning Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eveningStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evening Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Route Stops */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Route Stops</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ name: "", lat: 0, lng: 0, time: "", studentsCount: 0 })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stop
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Stop {index + 1}</h4>
                    {fields.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <FormField
                      control={form.control}
                      name={`stops.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stop Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Pioneer Estate Stage" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`stops.${index}.lat`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.000001"
                              placeholder="0.5200" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`stops.${index}.lng`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.000001"
                              placeholder="35.2800" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`stops.${index}.time`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`stops.${index}.studentsCount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Students</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="5" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Adding Route...
                  </>
                ) : (
                  "Add Route"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}