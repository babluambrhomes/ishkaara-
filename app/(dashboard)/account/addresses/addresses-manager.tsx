'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  deleteAddress,
  saveAddress,
  setDefaultAddress,
} from '@/lib/actions/address.actions'
import { AddressInputSchema } from '@/lib/validator'
import { IAddressWithId } from '@/types'
import {
  Briefcase,
  CheckCircle2,
  Home,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from 'lucide-react'

type AddressFormValues = z.infer<typeof AddressInputSchema>

const LABELS = {
  Home: { label: 'Home', icon: Home },
  Office: { label: 'Office', icon: Briefcase },
  Other: { label: 'Other', icon: MapPin },
} as const

function LabelIcon({ label, className }: { label: string; className?: string }) {
  const Icon = LABELS[label as keyof typeof LABELS]?.icon || MapPin
  return <Icon className={className} />
}

function AddressForm({
  editing,
  defaultPhone,
  onDone,
}: {
  editing: IAddressWithId | null
  defaultPhone: string
  onDone: () => void
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(AddressInputSchema),
    defaultValues: editing
      ? {
          _id: editing._id,
          label: editing.label,
          fullName: editing.fullName,
          street: editing.street,
          city: editing.city,
          province: editing.province,
          postalCode: editing.postalCode,
          phone: editing.phone,
          country: editing.country || 'India',
          isDefault: editing.isDefault,
        }
      : {
          label: 'Home',
          fullName: '',
          street: '',
          city: '',
          province: '',
          postalCode: '',
          phone: defaultPhone,
          country: 'India',
          isDefault: false,
        },
  })

  const onAddressSubmit = async (values: AddressFormValues) => {
    setSubmitting(true)
    const res = await saveAddress(values)
    setSubmitting(false)
    if (!res.success) {
      toast({ title: 'Error', description: res.message, variant: 'destructive' })
      return
    }
    toast({ description: res.message })
    form.reset()
    onDone()
    router.refresh()
  }

  return (
    <Card className='mb-6 overflow-hidden rounded-3xl border-gold/30 bg-white '>
      <CardContent className='p-5 sm:p-6'>
        <div className='mb-5 flex items-center justify-between gap-3'>
          <div className='flex items-center gap-2'>
            <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-gold text-white '>
              <MapPin className='h-5 w-5' />
            </span>
            <h3 className='text-lg font-bold tracking-tight'>
              {editing ? 'Edit Address' : 'Add New Address'}
            </h3>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={onDone}
            aria-label='Close form'
          >
            <X className='h-5 w-5' />
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onAddressSubmit)} className='space-y-5'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='label'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select label' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='Home'>Home</SelectItem>
                        <SelectItem value='Office'>Office</SelectItem>
                        <SelectItem value='Other'>Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='fullName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder='Recipient name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='street'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='House no, building, street, area'
                      className='resize-none'
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder='City' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='province'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State / Province</FormLabel>
                    <FormControl>
                      <Input placeholder='State' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-4 sm:grid-cols-3'>
              <FormField
                control={form.control}
                name='postalCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal code</FormLabel>
                    <FormControl>
                      <Input placeholder='PIN code' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='country'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder='Country' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        type='tel'
                        inputMode='tel'
                        placeholder='Phone number'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='isDefault'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center gap-2 space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className='cursor-pointer font-normal'>
                    Set as default address
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex flex-wrap justify-end gap-3'>
              <Button
                type='button'
                variant='outline'
                onClick={onDone}
                className='h-10 rounded-full px-5'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={submitting}
                className='h-10 rounded-full px-6'
              >
                {submitting && <Loader2 className='h-4 w-4 animate-spin' />}
                {submitting
                  ? 'Saving...'
                  : editing
                    ? 'Update Address'
                    : 'Save Address'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function ConfirmDeleteAddress({
  onConfirmed,
}: {
  onConfirmed: () => void
}) {
  const confirm = () => {
    onConfirmed()
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-9 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive'
        >
          <Trash2 className='h-4 w-4' />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this address?</AlertDialogTitle>
          <AlertDialogDescription>
            Both the shipping address and this entry will be removed. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function AddressesManager({
  addresses: initialAddresses,
  defaultPhone,
}: {
  addresses: IAddressWithId[]
  defaultPhone: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [addresses, setAddresses] = useState(initialAddresses)
  const [editing, setEditing] = useState<IAddressWithId | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [settingDefault, setSettingDefault] = useState<string | null>(null)

  useEffect(() => {
    setAddresses(initialAddresses)
  }, [initialAddresses])

  const openAdd = () => {
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (address: IAddressWithId) => {
    setEditing(address)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
  }

  const handleSetDefault = async (id: string) => {
    setSettingDefault(id)
    const res = await setDefaultAddress(id)
    setSettingDefault(null)
    if (!res.success) {
      toast({ title: 'Error', description: res.message, variant: 'destructive' })
      return
    }
    toast({ description: res.message })
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a._id === id }))
    )
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    const res = await deleteAddress(id)
    if (!res.success) {
      toast({ title: 'Error', description: res.message, variant: 'destructive' })
      return
    }
    toast({ description: res.message })
    setAddresses((prev) => {
      const next = prev.filter((a) => a._id !== id)
      return next.length === 0 || next.some((a) => a.isDefault)
        ? next
        : [{ ...next[0], isDefault: true }, ...next.slice(1)]
    })
    router.refresh()
  }

  if (showForm) {
    return (
      <AddressForm
        editing={editing}
        defaultPhone={defaultPhone}
        onDone={closeForm}
      />
    )
  }

  return (
    <div>
      {addresses.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-white px-6 py-16 text-center '>
          <span className='flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-gold text-white '>
            <MapPin className='h-8 w-8' />
          </span>
          <h3 className='mt-5 text-xl font-bold tracking-tight'>
            No saved addresses yet
          </h3>
          <p className='mt-1.5 max-w-md text-sm leading-6 text-muted-foreground'>
            Add your delivery address to make checkout faster and smoother.
          </p>
          <Button
            type='button'
            onClick={openAdd}
            className='mt-6 h-10 rounded-full px-6'
          >
            <Plus className='h-4 w-4' />
            Add your first address
          </Button>
        </div>
      ) : (
        <>
          <div className='mb-5 flex items-center justify-between gap-3'>
            <p className='text-sm font-medium text-muted-foreground'>
              {addresses.length} saved{' '}
              {addresses.length === 1 ? 'address' : 'addresses'}
            </p>
            <Button
              type='button'
              onClick={openAdd}
              variant='outline'
              className='h-10 rounded-full border-primary/30 px-5 text-primary hover:bg-primary hover:text-primary-foreground'
            >
              <Plus className='h-4 w-4' />
              Add Address
            </Button>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            {addresses.map((address) => (
              <Card
                key={address._id}
                className={`overflow-hidden rounded-3xl bg-white  transition-all hover:-translate-y-0.5  ${
                  address.isDefault
                    ? 'border-gold/60 ring-1 ring-gold/30'
                    : 'border-border/60'
                }`}
              >
                <CardContent className='flex h-full flex-col p-5'>
                  <div className='mb-4 flex items-center justify-between gap-2'>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                        address.label === 'Home'
                          ? 'bg-primary/10 text-primary'
                          : address.label === 'Office'
                            ? 'bg-gold/15 text-gold'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <LabelIcon label={address.label} className='h-3.5 w-3.5' />
                      {LABELS[address.label as keyof typeof LABELS]?.label || address.label}
                    </span>
                    {address.isDefault ? (
                      <Badge className='gap-1 rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white'>
                        <Star className='h-3 w-3 fill-current' />
                        Default
                      </Badge>
                    ) : (
                      <span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                        <LabelIcon label='Other' className='h-3.5 w-3.5 opacity-40' />
                      </span>
                    )}
                  </div>

                  <h3 className='text-base font-bold tracking-tight'>
                    {address.fullName}
                  </h3>
                  <p className='mt-0.5 text-sm text-muted-foreground'>
                    {address.phone}
                  </p>
                  <p className='mt-3 text-sm leading-6 text-foreground'>
                    {address.street}
                    <br />
                    {address.city}, {address.province}, {address.postalCode}
                    <br />
                    {address.country}
                  </p>

                  <div className='mt-auto flex flex-wrap items-center gap-2 pt-5'>
                    {!address.isDefault && (
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        disabled={settingDefault === address._id}
                        onClick={() => handleSetDefault(address._id)}
                        className='h-9 rounded-full border-gold/40 text-gold hover:bg-gold hover:text-white'
                      >
                        {settingDefault === address._id ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <CheckCircle2 className='h-4 w-4' />
                        )}
                        Set default
                      </Button>
                    )}
                    <Button
                      type='button'
                      size='sm'
                      variant='outline'
                      onClick={() => openEdit(address)}
                      className='h-9 rounded-full'
                    >
                      <Pencil className='h-4 w-4' />
                      Edit
                    </Button>
                    <ConfirmDeleteAddress
                      onConfirmed={() => handleDelete(address._id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}